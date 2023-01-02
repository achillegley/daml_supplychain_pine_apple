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
import { getName, getParty } from "../../config";

export default function CCetificateHarvest() {
  const classes = useStyles();
  const party = useParty();
  const ledger : Ledger = useLedger();
  const myCHarvests = useStreamQueries(CertificateHarvest);
  const companies = useStreamQueries(Company);
  const harvests = useStreamQueries(Harvest);
  console.log("the certificate ", myCHarvests)

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
  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow className={classes.tableRow}>
            <TableCell key={0} className={classes.tableCell}>Responsible</TableCell>
            <TableCell key={1} className={classes.tableCell}>harvest</TableCell>
            <TableCell key={2} className={classes.tableCell}>Company</TableCell>
            <TableCell key={3} className={classes.tableCell}>Farmer operator</TableCell>
            <TableCell key={4} className={classes.tableCell}>Date</TableCell>
            <TableCell key={5} className={classes.tableCell}>Content</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {myCHarvests.contracts.map(a => (
            <TableRow key={a.contractId} className={classes.tableRow}>
              <TableCell key={0} className={classes.tableCell}>{getName(a.payload.officer)}</TableCell>
              <TableCell key={1} className={classes.tableCell}>{getHarvestCode(a.payload.harvest)}</TableCell>
              <TableCell key={2} className={classes.tableCell}>{getCompanyNameByHarvest(a.payload.harvest)}</TableCell>
              <TableCell key={3} className={classes.tableCell}>{getName(a.payload.farmerOperator)}</TableCell>
              <TableCell key={4} className={classes.tableCell}>{a.payload.createDate}</TableCell>
              <TableCell key={4} className={classes.tableCell}>{a.payload.content}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
