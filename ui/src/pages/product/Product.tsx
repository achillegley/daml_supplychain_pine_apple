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
import {  BoardingRequest , Boarding } from "@daml.js/apple-supply-chain-prototype-0.0.1/lib/Boarding";
import { Harvest } from "@daml.js/apple-supply-chain-prototype-0.0.1/lib/Harvest";
import { Product } from "@daml.js/apple-supply-chain-prototype-0.0.1/lib/Product";
import { InputDialog, InputDialogProps } from "./InputDialog";
import useStyles from "./styles";
import { getName, getParties, getParty } from "../../config";

export default function CHarvest() {
    const classes = useStyles();
    const party = useParty();
    const ledger : Ledger = useLedger();
    const products = useStreamQueries(Product);
    const companies = useStreamQueries(Company);
    const harvests = useStreamQueries(Harvest);
    const boardingrequests=useStreamQueries(BoardingRequest);
    const boardings=useStreamQueries(Boarding);
    
    //console.log("parties: ", Object.values(parties));

    function getCompanyNameByHarvest(harvestContractId:ContractId<Harvest>):string{
      let companyName=""
      harvests.contracts.map(b =>{
        if(b.contractId === harvestContractId)
        {
          companyName=getCustomCompanyName(b.payload.company);
        }
      })
      return companyName     
    }

    function getHarvestCode(harvestContractId:ContractId<Harvest>):string{
      let harvestCode=""
      harvests.contracts.map(b =>{
        if(b.contractId === harvestContractId)
        {
          harvestCode=b.payload.code;
        }
      })
      return harvestCode     
    }

    function getCustomCompanyName(companyContractId:ContractId<Company>):string{
      let companyName=""
      companies.contracts.map(c =>{
        if(c.contractId === companyContractId)
        {
          companyName = c.payload.company.name;
        }
      })
      return companyName     
    }
    function getTransportCompanies():{cid:string,name:string}[]
    {
      let transportCompanies=[{
        cid:"",
        name:""
      }]
      companies.contracts.map(a=>{
        if(a.payload.company.category.includes("Transport")){
          transportCompanies.push({
            cid:a.contractId,
            name:a.payload.company.name
          });
        }
      })
      return transportCompanies;
    }

    function getCompaniesName():{cid:string,name:string}[]{
      let names=[{
        cid:"",
        name:""
      }]
      companies.contracts.map(a=>{
        console.log("category: ",a.payload.company.category);
        if(a.payload.company.category.includes("ProcessingCompany"))
        {
          names.push({
            cid:a.contractId,
            name:a.payload.company.name
          });
        }
      });
      return names;
    }

    type OrderRequestType={
      //product: typeof ContractId<Product>,
      transportCompany: string,
      //driver:typeof party,
      //operator:typeof party,
      quantity:string,
      //departure:string,
      destination:string
      //createDate: ""
    }

    type FieldOrderRequest=Omit<OrderRequestType,"issuer">
    const defaultOrderRequestProps:InputDialogProps<FieldOrderRequest>={
      open:false,
      title:"Request Order",
      defaultValue:{
        //driver:getParty("TransportCompanyOperator"),
        transportCompany:"",
        quantity:"",
        //departure:"",
        destination:""
      },
      fields:{
        transportCompany:{
          label:"TransportCompany",
          type:"transport_selection",
          items:getTransportCompanies(),
        },
        quantity:{
          label:"Quantity of Product",
          type:"text",
        },
        destination:{
          label:"Destination",
          type:"transport_selection",
          items:getCompaniesName(), 
        }
      },
      onClose: async function() {}
    }
    const [orderRequestProps,SetOrderRequestProps]=useState(defaultOrderRequestProps);
    function requestOrder(productContractId:ContractId<Product>)
    {
      async function onClose(state : FieldOrderRequest | null) {
        SetOrderRequestProps({ ...defaultOrderRequestProps, open: false});
        if (!state) return;
        console.log("the state ===> ", state)
        const withIssuer = { 
          issuer: party ,
          code:(boardingrequests.contracts.length).toString(),
          content:{
            product:productContractId,
            transportCompany:getTransportCompany(state.transportCompany), 
            driver:getTransportOperator(state.transportCompany),destination:getTransportCompany(state.destination),
            operator: party, quantity:state.quantity,departure:getOperatorCompany(), createDate:(new Date()).toISOString()
          }
        };
        await ledger.create(BoardingRequest, withIssuer);
        console.log("boarding requests ", boardingrequests)
      };
      SetOrderRequestProps({ ...defaultOrderRequestProps, open: true, onClose});
    }

    function getTransportOperator(companyContractId:string):typeof party
    {
      let transportOperator=party;
      companies.contracts.map(b=>{
        if((b.contractId).toString()===companyContractId)
        {
          transportOperator=b.payload.operator
        }
      });
      return transportOperator;
    }

    function getOperatorCompany():ContractId<Company>
    {
      let companyCid:ContractId<Company>=companies.contracts[0].contractId;
      companies.contracts.map(p=>{
        if(p.payload.operator===party)
        {
          companyCid=p.contractId;
        }
      });
      return companyCid;
    }
    
    function getTransportCompany(transportCompanyCid:string):ContractId<Company>
    {
      let company:ContractId<Company>=companies.contracts[0].contractId;
      companies.contracts.map(b=>{
        if((b.contractId).toString()===transportCompanyCid)
        {
          company=b.contractId
        }
      });
      return company;
    }

    function isOrdered(productCid:ContractId<Product>):boolean
    {
      let isOrdered = false;
      boardings.contracts.map(b=>{
        if(b.payload.content.product===productCid)
        {
          isOrdered=true;
        }
      })
      if(isOrdered==false)
      {
        boardingrequests.contracts.map(b=>{
          if(b.payload.content.product===productCid)
          {
            isOrdered=true;
          }
        })
      }
      return isOrdered;
    }

    return (
      <>
        <InputDialog { ...orderRequestProps } />
        <Table size="small">
          <TableHead>
            <TableRow className={classes.tableRow}>
              <TableCell key={0} className={classes.tableCell}>Operator</TableCell>
              <TableCell key={1} className={classes.tableCell}>Label</TableCell>
              <TableCell key={2} className={classes.tableCell}>Description</TableCell>
              <TableCell key={3} className={classes.tableCell}>Company</TableCell>
              <TableCell key={4} className={classes.tableCell}>Event</TableCell>
              <TableCell key={5} className={classes.tableCell}>Origin</TableCell>
              <TableCell key={6} className={classes.tableCell}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.contracts.map(a => (
              <TableRow key={a.contractId} className={classes.tableRow}>
                <TableCell key={0} className={classes.tableCell}>{getName(a.payload.owner)}</TableCell>
                <TableCell key={1} className={classes.tableCell}>{a.payload.item.label}</TableCell>
                <TableCell key={2} className={classes.tableCell}>{a.payload.item.description}</TableCell>
                <TableCell key={3} className={classes.tableCell}> {
                    a.payload.item.harvestEvent?
                      (getCompanyNameByHarvest(a.payload.item.harvestEvent.harvestCid)):
                      ('')
                    }
                </TableCell>
                <TableCell key={4} className={classes.tableCell}>{a.payload.item.eventType}</TableCell>
                <TableCell key={5} className={classes.tableCell}>{
                   a.payload.item.harvestEvent?
                    (getHarvestCode(a.payload.item.harvestEvent.harvestCid)):
                    ('')
                  }
                </TableCell>
                <TableCell key={6} className={classes.tableCellButton}>
                  { !isOrdered(a.contractId)?
                   (
                    <Button color="primary" size="small" className={classes.choiceButton} variant="contained" disabled={a.payload.owner !== party} onClick={() => requestOrder(a.contractId)}>Request Order</Button>
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
