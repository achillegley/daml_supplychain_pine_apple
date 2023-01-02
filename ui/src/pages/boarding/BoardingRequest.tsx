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
import {  BoardingRequest  } from "@daml.js/apple-supply-chain-prototype-0.0.1/lib/Boarding";
import {Company } from '@daml.js/apple-supply-chain-prototype-0.0.1/lib/Company'
import useStyles from "./styles";
import { getName, getParties, getParty } from "../../config";
import { Product } from "@daml.js/apple-supply-chain-prototype-0.0.1/lib/Product";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Dialog from "@material-ui/core/Dialog";
import DialogContentText from "@material-ui/core/DialogContentText";

export default function CBoardingRequest() {
    const classes = useStyles();
    const party = useParty();
    const ledger : Ledger = useLedger();
    const boardingrequests=useStreamQueries(BoardingRequest);
    const companies= useStreamQueries(Company);
    const products= useStreamQueries(Product);
    const parties=getParties();
    const partiesNames:string[]=Object.values(parties);

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

    
    type contentType={
      title:string,
      content:Record<string, any> ;
    }

    let defaultContentValue:contentType={title:"",content:{}};
    const [modalContent, setModalContent]=useState(defaultContentValue);
    const [openDisplayModal, setOpenDisplayModal] = React.useState(false);

    function displayProduct(productCid:ContractId<Product>)
    {
      let content= defaultContentValue;
      content.title="Product Information"
      products.contracts.map(a=>{
        if(a.contractId===productCid)
        {
          content.content.label=a.payload.item.label;
          content.content.description=a.payload.item.description;
        }
      })
      setModalContent(content);
      setOpenDisplayModal(true); 
    };
   
    function acceptOrder(requestCid:ContractId<BoardingRequest>){
      ledger.exercise(BoardingRequest.ValidateBoarding, requestCid, { signDate: (new Date()).toISOString(), readers:partiesNames} );
    };
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
        {/*<DisplayModal { ...modalContent } />*/}
        <Table size="small">
          <TableHead>
            <TableRow className={classes.tableRow}>
              <TableCell key={0} className={classes.tableCell}>Operator</TableCell>
              <TableCell key={1} className={classes.tableCell}>Driver</TableCell>
              <TableCell key={2} className={classes.tableCell}>Product</TableCell>
              <TableCell key={3} className={classes.tableCell}>Quantity</TableCell>
              <TableCell key={4} className={classes.tableCell}>Departure</TableCell>
              <TableCell key={5} className={classes.tableCell}>Destination</TableCell>
              <TableCell key={6} className={classes.tableCell}>CreateDate</TableCell>
              <TableCell key={7} className={classes.tableCell}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {boardingrequests.contracts.map(a => (
              <TableRow key={a.contractId} className={classes.tableRow}>
                <TableCell key={0} className={classes.tableCell}>{getName(a.payload.content.operator)}</TableCell>
                <TableCell key={1} className={classes.tableCell}>{getName(a.payload.content.driver)}</TableCell>
                <TableCell key={2} className={classes.tableCell}>
                  <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => {displayProduct(a.payload.content.product);}}>show</Button>
                </TableCell>
                <TableCell key={3} className={classes.tableCell}>{a.payload.content.quantity}</TableCell>
                <TableCell key={4} className={classes.tableCell}>{getCompanyAddress(a.payload.content.departure)}</TableCell>
                <TableCell key={5} className={classes.tableCell}>{getCompanyAddress(a.payload.content.destination)}</TableCell>
                <TableCell key={6} className={classes.tableCell}>{a.payload.content.createDate}</TableCell>
                <TableCell key={7} className={classes.tableCellButton}>
                  <Button color="primary" size="small" className={classes.choiceButton} variant="contained" disabled={a.payload.content.driver!==party} onClick={() => acceptOrder(a.contractId)}>Validate</Button>
                </TableCell>
              </TableRow>
              
            ))}
          </TableBody>
        </Table>
      </>
    );
  
}
