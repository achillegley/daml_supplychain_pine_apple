import React, { createFactory, useState } from "react";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Button from "@material-ui/core/Button";
import Ledger from "@daml/ledger";
import { useStreamQueries, useLedger, useParty } from "@daml/react";
import { ContractId } from "@daml/types";
import {  DeliveryRequest,Delivery  } from "@daml.js/apple-supply-chain-prototype-0.0.1/lib/Delivery";
import {Company} from '@daml.js/apple-supply-chain-prototype-0.0.1/lib/Company'
import useStyles from "./styles";
import { getName, getParties, getParty } from "../../config";
import { Product } from "@daml.js/apple-supply-chain-prototype-0.0.1/lib/Product";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Dialog from "@material-ui/core/Dialog";
import DialogContentText from "@material-ui/core/DialogContentText";
import { Boarding } from "@daml.js/apple-supply-chain-prototype-0.0.1/lib/Boarding";
import { Processing } from "@daml.js/apple-supply-chain-prototype-0.0.1/lib/Processing";
import { Harvest } from "@daml.js/apple-supply-chain-prototype-0.0.1/lib/Harvest";
import { InputDialog , InputDialogProps } from "./InputDialog";

export default function CDeliveryRequest() {
    const classes = useStyles();
    const party = useParty();
    const ledger : Ledger = useLedger();
    const deliveries=useStreamQueries(Delivery);
    const deliveryRequests= useStreamQueries(DeliveryRequest);
    const boardings= useStreamQueries(Boarding);
    const companies= useStreamQueries(Company);
    const products= useStreamQueries(Product);
    const processings= useStreamQueries(Processing);
    const harvests= useStreamQueries(Harvest);
    const parties=getParties();
    const partiesNames:string[]=Object.values(parties);
    
    type contentType={
      title:string,
      content:Record<string, any> ;
    }

    let defaultContentValue:contentType={title:"",content:{}};
    const [modalContent, setModalContent]=useState(defaultContentValue);
    const [openDisplayModal, setOpenDisplayModal] = React.useState(false);


    function getCompanyAddress(companyCid:ContractId<Company>)
    {
      let currentAddress=""
      companies.contracts.map(a=>{
          if(a.contractId===companyCid)
          {
            currentAddress=a.payload.company.address;
          }
      });
      return currentAddress;
    }



    function displayBoarding(boardingCid:ContractId<Boarding>)
    {
      let content= defaultContentValue;
      content.title="Order Information";
      boardings.contracts.map(a=>{
        if(a.contractId===boardingCid)
        {
          let productContent=getProductContent(a.payload.content.product);
          content.content.transport=getCompanyAddress(a.payload.content.transportCompany);
          content.content.driver=getName(a.payload.content.driver);
          content.content.operator=getName(a.payload.content.operator);
          content.content.label=productContent.label;
          content.content.description=productContent.description;
          content.content.departure=getCompanyAddress(a.payload.content.departure);
          content.content.destination=getCompanyAddress(a.payload.content.destination);
          content.content.createDate=a.payload.content.createDate;
        }
      })
      setModalContent(content);
      setOpenDisplayModal(true); 
    };

    function getProductContent(productCid:ContractId<Product>):Record<string, any>
    {
      let content={
        label:"",
        description:""  
      }
      products.contracts.map(a=>{
        if(a.contractId===productCid)
        {
          content.label=a.payload.item.label;
          content.description=a.payload.item.description;
        }
      });
      return content;
    };

    function acceptDelivery(deliveryRequestCid:ContractId<DeliveryRequest>)
    {
      deliveryRequests.contracts.map(a=>{
        if(a.contractId===deliveryRequestCid)
        {
          let withContent={
            content:a.payload.content,
            signDate:(new Date()).toISOString(),
            readers:partiesNames
          }
          ledger.exercise(DeliveryRequest.ValidateDelivery, deliveryRequestCid,withContent );
        }
      })
    }

    function displayCompany(companyCid:ContractId<Company>)
    {
      let content= defaultContentValue;
      content.title="Company Information";
      companies.contracts.map(a=>{
        if(a.contractId===companyCid)
        {
          content.content.name=a.payload.company.name
          content.content.category=a.payload.company.category
          content.content.address=a.payload.company.address
          content.content.operator=getName(a.payload.operator)
          content.content.code=a.payload.code
          content.content.owner=getName(a.payload.owner)
        }
      })
      setModalContent(content);
      setOpenDisplayModal(true); 
    }

    function displayProduct(productCid:ContractId<Product>)
    {
      let content= defaultContentValue;
      content.title="Product Information";
      products.contracts.map(a=>{
        if(a.contractId===productCid)
        {
          if(a.payload.item.harvestEvent!==null)
          {
            let harvestContent=getHarvestContent(a.payload.item.harvestEvent.harvestCid);
            content.content.harvest_code=harvestContent?.code
            content.content.harvest_createDate=harvestContent?.createDate
          }
          content.content.label=a.payload.item.label
          content.content.description=a.payload.item.description
          content.content.enventType=a.payload.item.eventType
          content.content.operator=a.payload.owner

          content.content.owner=getName(a.payload.owner)
        }
      })
      setModalContent(content);
      setOpenDisplayModal(true); 
    }
    
    function getHarvestContent(harvestCid:ContractId<Harvest>):Record<string, any>
    {
      let content={
        code:"",
        createDate:"",
      }
      harvests.contracts.map(a=>{
        if(a.contractId===harvestCid)
        {
          content.code=a.payload.code;
          content.createDate=a.payload.createDate;
        }
      });
      return content;
    };

    const partyCompany=getPartyCompany();
    function getProducts():{cid:string,label:string}[]{
      let productProps=[{
        cid:"",
        label:""
      }];
      if(partyCompany)
      {
        deliveries.contracts.map(d=>{
            boardings.contracts.map(b=>{
              if(d.payload.content.boarding===b.contractId)
              {
                let curentProductContent=getProductContent(b.payload.content.product);
                productProps.push({
                  cid:b.payload.content.product,
                  label:curentProductContent?.label
                });
              }
            })
        })
      }
      return productProps;
    }

    function getPartyCompany(){
      let partyCompany;
      companies.contracts.map(c=>{
        if(c.payload.operator===party)
        {
          partyCompany=c.contractId;
        }
      })
      return partyCompany
    }
    type ProcessingType={
      ingredients:string,
      product?:ContractId<Product>,
      /*ingredients: Text
    createDate: Time
    companyOperator: Party
    company: ContractId C.Company
    readers:[Party]*/
    }
    type InputFieldsForProcessing = Omit<ProcessingType, "issuer">;
    const defaultProcessingProps : InputDialogProps<InputFieldsForProcessing> = {
      open: false,
      title: "Create Processing",
      defaultValue: {
        ingredients:"",
      },
      fields: {
        ingredients:{
          label:"ingredients",
          type:"text",
        },
        product:{
          label:"Product de base",
          type:"product_selection",
          items:getProducts(),
        }
      },
      onClose: async function() {}
    };

    const [processingProps, setProcessingProps] = useState(defaultProcessingProps);
    function createProcessing()
    {
      async function onClose(state: InputFieldsForProcessing| null){
        setProcessingProps({...defaultProcessingProps, open:false});
        if(!state) return;
        console.log("the state === >", state);
        if(state.product!==undefined && partyCompany!==undefined)
        {
          let withContent={
            content:{ 
              fruit: state.product,
              ingredients: state.ingredients,
              createDate: (new Date()).toISOString(),
              companyOperator: party,
              company: partyCompany,
              readers:partiesNames,
            }
          }
          await ledger.create(Processing, withContent);
        }
      };
      setProcessingProps({...defaultProcessingProps, open: true, onClose});
    }

    function displayCreateButon(){
      if(getName(party)==="ProcessingCompanyOperator")
        {
          return(
            <Button color="primary" size="small"  className={classes.choiceButton} variant="contained" onClick={() => createProcessing()}>
              Create Processing 
            </Button>
          )
        }
    }

    return (
      <>
        <InputDialog { ...processingProps } />
        <Dialog open={openDisplayModal} >
          <DialogTitle>{modalContent.title}</DialogTitle>
          <DialogContent>
          <DialogContentText>
            {
              <Table size="small">
                <TableBody>
                {Object.keys(modalContent.content)?.map((key, index) => {
                  return (
                    <TableRow key={index} className={classes.tableRow}>
                      <TableCell key={index} className={classes.tableCell}>{key}</TableCell>
                      <TableCell key={index} className={classes.tableCell}>{modalContent?.content[key]}</TableCell>
                    </TableRow>
                  );
                })}
                </TableBody>
              </Table>  
            }
          </DialogContentText>
          </DialogContent>
          <DialogActions>
          <Button 
           onClick={()=>setOpenDisplayModal(false)}
              color="primary" autoFocus>
            Close
          </Button>
          </DialogActions>
        </Dialog>
        {displayCreateButon()}
        <Table size="small">
          <TableHead>
            <TableRow className={classes.tableRow}>
              <TableCell key={0} className={classes.tableCell}>Company</TableCell>
              <TableCell key={1} className={classes.tableCell}>Processed Product</TableCell>
              <TableCell key={2} className={classes.tableCell}>Ingredients</TableCell>
              <TableCell key={3} className={classes.tableCell}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {processings.contracts.map(a => (
              <TableRow key={a.contractId} className={classes.tableRow}>
                <TableCell key={0} className={classes.tableCell}>
                  <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => {displayCompany(a.payload.content.company);}}>show</Button>
                </TableCell>
                <TableCell key={1} className={classes.tableCell}>
                <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => {displayProduct(a.payload.content.fruit);}}>show</Button>
                </TableCell>
                <TableCell key={2} className={classes.tableCell}>{a.payload.content.ingredients}</TableCell>
                <TableCell key={3} className={classes.tableCell}>
                </TableCell>                
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>
    );
  
}
