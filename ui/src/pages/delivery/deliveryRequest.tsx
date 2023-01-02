import React, { useState } from "react";
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

export default function CDeliveryRequest() {
    const classes = useStyles();
    const party = useParty();
    const ledger : Ledger = useLedger();
    const deliveries=useStreamQueries(Delivery);
    const deliveryRequests= useStreamQueries(DeliveryRequest);
    const boardings= useStreamQueries(Boarding);
    const companies= useStreamQueries(Company);
    const products= useStreamQueries(Product);
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
    return (
      <>
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
        <Table size="small">
          <TableHead>
            <TableRow className={classes.tableRow}>
              <TableCell key={0} className={classes.tableCell}>Driver</TableCell>
              <TableCell key={1} className={classes.tableCell}>CompanyOperator</TableCell>
              <TableCell key={3} className={classes.tableCell}>Order</TableCell>
              <TableCell key={4} className={classes.tableCell}>CreateDate</TableCell>
              <TableCell key={5} className={classes.tableCell}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deliveryRequests.contracts.map(a => (
              <TableRow key={a.contractId} className={classes.tableRow}>
                <TableCell key={0} className={classes.tableCell}>{getName(a.payload.content.driver)}</TableCell>
                <TableCell key={1} className={classes.tableCell}>{getName(a.payload.content.companyOperator)}</TableCell>
                <TableCell key={2} className={classes.tableCell}>
                  <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => {displayBoarding(a.payload.content.boarding);}}>show</Button>
                </TableCell>
                <TableCell key={4} className={classes.tableCell}>{a.payload.content.deliveryDate}</TableCell>
                <TableCell key={5} className={classes.tableCell}>
                  <Button color="primary" size="small" className={classes.choiceButton} variant="contained" disabled={a.payload.content.companyOperator!==party} onClick={() => acceptDelivery(a.contractId)}>Validate</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>
    );
  
}
