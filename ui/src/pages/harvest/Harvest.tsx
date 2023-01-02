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
import {  Company  } from "@daml.js/apple-supply-chain-prototype-0.0.1/lib/Company";
import { Harvest, CertificateHarvest } from "@daml.js/apple-supply-chain-prototype-0.0.1/lib/Harvest";
import { Product } from "@daml.js/apple-supply-chain-prototype-0.0.1/lib/Product";
import { InputDialog, InputDialogProps } from "./InputDialog";
import useStyles from "./styles";
import { getName,getParties, getParty } from "../../config";
import { Content } from "@daml.js/apple-supply-chain-prototype-0.0.1/lib/DeliveryWareHouse";

export default function CHarvest() {
  const classes = useStyles();
  const party = useParty();
  const ledger : Ledger = useLedger();
  const myHarvests = useStreamQueries(Harvest);
  const companies = useStreamQueries(Company);
  const products = useStreamQueries(Product);
  const cHarvests= useStreamQueries(CertificateHarvest);
  const parties=getParties();
  const partiesNames:string[]=Object.values(parties);
  //console.log("current party === ", myHarvests)
 
  type ProductType = {
    label:"",
    description:"",
    readers:""
  }
  type InputFieldsForNewProduct = Omit<ProductType, "issuer">;
  const defaultNewProductProps: InputDialogProps<InputFieldsForNewProduct>={
    open: false,
      title: "Create Product",
      defaultValue: {
        label:"",
        description:"",
        readers:""
      },
      fields: {
        label: {
          label: "Label",
          type: "text",
        },
        description: {
          label: "Description",
          type: "text",
        },
        readers:{
          label: "readers",
          type: "selection",
          items: ["CertificateOfficer"]
        }
      },
      onClose: async function() {}
  };
  const [newProductProps, setNewProductProps] = useState(defaultNewProductProps);
  
  function createProduct(harvestContractId:ContractId<Harvest>)
  {
    async function onClose(state : InputFieldsForNewProduct | null) {
      setNewProductProps({ ...defaultNewProductProps, open: false});
      if (!state) return;
      console.log("the state ===> ", state)
      const withIssuer = { 
        issuer: party , owner: party, readers:partiesNames,
        item: {
          label:state.label,
          description:state.description,
          harvestEvent:{
            harvestCid:harvestContractId
          },
          eventType:"harvest",
          code:(products.contracts.length).toString()
        }, 
      };
      await ledger.create(Product, withIssuer);
      
    };
    setNewProductProps({ ...defaultNewProductProps, open: true, onClose});
    
  }

  function isCertificated(harvestCid:ContractId<Harvest>)
  {
    let isCertificated=false;
    cHarvests.contracts.map(a=>{
      if(a.payload.harvest===harvestCid){
        isCertificated=true;
      }
    });
    return isCertificated;
  }

  type CertificateHarvestType={
    content:""
  }

  type FieldCHarvest=Omit<CertificateHarvestType,"issuer">;
  const defaultCHarvestProps: InputDialogProps<FieldCHarvest>={
    open: false,
      title: "Certify Harvest",
      defaultValue: {
        content:""
      },
      fields: {
        content: {
          label: "Hash Certificate File",
          type: "text",
        }
      },
      onClose: async function() {}
  };
  const [newCHProps, setCHProps] = useState(defaultCHarvestProps);
  function CertifyHarvest(harvestContractId:ContractId<Harvest>)
  {
    async function onClose(state : FieldCHarvest | null) {
      setCHProps({ ...defaultCHarvestProps, open: false});
      if (!state) return;
      console.log("the state ===> ", state)
      const withIssuer = { 
        issuer: party , officer: party, readers:[], farmerOperator:getFarmerOperatorParty(harvestContractId) , 
        content: state.content, harvest:harvestContractId, createDate:(new Date()).toISOString(),
        code:(cHarvests.contracts.length).toString()
      };
      await ledger.create(CertificateHarvest, withIssuer);
      
    };
    setCHProps({ ...defaultCHarvestProps, open: true, onClose});
    
  }

  function getFarmerOperatorParty(harvestContractId:ContractId<Harvest>):string{
    let farmerOperator=""
    myHarvests.contracts.map(b=>{
      if(b.contractId===harvestContractId)
      {
        farmerOperator=b.payload.operator
      }
    });
    return farmerOperator;
  }
  function customGetCompanyName(companyContractId:ContractId<Company>):string{
    let companyName=""
    companies.contracts.map(b =>{
      if(b.contractId === companyContractId)
      {
        companyName = b.payload.code;
      }
    })
    return companyName     
  }

  function harvestHasProduct(harvestContractId:ContractId<Harvest>):boolean{
    let hasProduct=false;
    products.contracts.map(b=>{
      if(b.payload.item.harvestEvent?.harvestCid===harvestContractId)
      {
        hasProduct=true;
      }
    })
    return hasProduct;
  }
  return (
    <>
      <InputDialog { ...newProductProps } />
      <InputDialog { ...newCHProps } />
      <Table size="small">
        <TableHead>
          <TableRow className={classes.tableRow}>
            <TableCell key={0} className={classes.tableCell}>Code</TableCell>
            <TableCell key={1} className={classes.tableCell}>Operator</TableCell>
            <TableCell key={2} className={classes.tableCell}>Date</TableCell>
            <TableCell key={3} className={classes.tableCell}>Company</TableCell>
            <TableCell key={4} className={classes.tableCell}>QUantity</TableCell>
            <TableCell key={5} className={classes.tableCell}>Product Item</TableCell>
            <TableCell key={6} className={classes.tableCell}>Certification</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {myHarvests.contracts.map(a => (
            <TableRow key={a.contractId} className={classes.tableRow}>
              <TableCell key={0} className={classes.tableCell}>{a.payload.code}</TableCell>
              <TableCell key={1} className={classes.tableCell}>{getName(a.payload.operator)}</TableCell>
              <TableCell key={2} className={classes.tableCell}>{a.payload.createDate}</TableCell>
              <TableCell key={3} className={classes.tableCell}>{customGetCompanyName(a.payload.company)}</TableCell>
              <TableCell key={4} className={classes.tableCell}>{a.payload.quantity}</TableCell>
              <TableCell key={5} className={classes.tableCellButton}>
                <Button color="primary" size="small" className={classes.choiceButton} variant="contained" disabled={a.payload.operator !== party || harvestHasProduct(a.contractId)==true} onClick={() => createProduct(a.contractId)}>Create</Button>
              </TableCell>
              <TableCell key={6} className={classes.tableCellButton}>
                {
                  !isCertificated(a.contractId)?
                  (
                    <Button color="primary" size="small" className={classes.choiceButton} variant="contained" disabled={"CertificateOfficer" !== getName(party)} onClick={() => CertifyHarvest(a.contractId)}>Certify</Button>
                  ):
                  ('')
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
