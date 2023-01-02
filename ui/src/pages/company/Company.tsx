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
import { Item,CompanyCreation, Company, CompanyCategory,OperatorCategory  } from "@daml.js/apple-supply-chain-prototype-0.0.1/lib/Company";
import { Harvest, CertificateHarvest } from "@daml.js/apple-supply-chain-prototype-0.0.1/lib/Harvest";
import { InputDialog, InputDialogProps } from "./InputDialog";
import useStyles from "./styles";
import { getName, getParties, getParty } from "../../config";

export default function Report() {
  const classes = useStyles();
  const party = useParty();
  const ledger : Ledger = useLedger();
  const companies = useStreamQueries(Company);
  const harvests = useStreamQueries(Harvest);
  const parties=getParties();

  const partiesNames:string[]=Object.values(parties);
  //console.log("companies : ",companies)
  /*
  const <defaultGiveProps> : InputDialogProps<Give> = {
    open: false,
    title: "Give Asset",
    defaultValue: { newOwner : "" },
    fields: {
      newOwner : {
        label: "New Owner",
        type: "selection",
        items: [ "Alice", "Bob","BusinessOwner", "FarmerOperator" ] } },
    onClose: async function() {}
  };

  const [ giveProps, setGiveProps ] = useState(defaultGiveProps);
  // One can pass the original contracts CreateEvent
  function showGive(asset : Asset.CreateEvent) {
    async function onClose(state : Give | null) {
      setGiveProps({ ...defaultGiveProps, open: false});
      // if you want to use the contracts payload
      if (!state || asset.payload.owner === state.newOwner) return;
      await ledger.exercise(Asset.Give, asset.contractId, { newOwner: getParty(state.newOwner) } );
    };
    setGiveProps({ ...defaultGiveProps, open: true, onClose})
  };*/
  type UserSpecifiedHarvest = Pick<Harvest,"quantity">;
  const today = (new Date()).toISOString().slice(0,10);
  const defaultHarvestProps : InputDialogProps<UserSpecifiedHarvest> = {
    open: false,
    title: "New Harvest",
    defaultValue: { 
      quantity:"0"
    },
    fields: {
      quantity : {
        label: "Quantité de produit",
        type: "number" }
      },
    onClose: async function() {}
  };

  const [ harvestProps, setHarvestProps ] = useState(defaultHarvestProps);
  
  // Or can pass just the ContractId of an
  
  function createHarvest(companyContractId : ContractId<Company>) {
    async function onClose(state : UserSpecifiedHarvest | null) {
      setHarvestProps({ ...defaultHarvestProps, open: false});
      if (!state) return;
      const withHarvestContent = { ...state, 
        issuer: party, operator:party ,createDate:(new Date()).toISOString(), 
        company:companyContractId, readers:partiesNames,
        code:(harvests.contracts.length).toString()
      };
      await ledger.create(Harvest, withHarvestContent);
    };
    setHarvestProps({...defaultHarvestProps, open: true, onClose});
  };

  type ReaderType= {
    reader:typeof party
  }

  type FieldReader=Omit<ReaderType,"issuer">;
  
  const defaultReaderProps: InputDialogProps<FieldReader>={
    open: false,
    title: "CreateReader",
    defaultValue:{
      reader:""
    },
    fields:{
      reader:{
        label:"reader",
        type:"selection",
        items:["CertificateOfficer","FarmerOperator","BusinessOwner",
        "TransportCompanyOperator",
        "ProcessingCompanyOperator"
        ]
      }
    },
    onClose: async function() {}
  }
  const [readerProps, setReaderProps] = useState(defaultReaderProps);
  function createReader(companyContractId : ContractId<Company>) {
    async function onClose(state : FieldReader | null) {
      setReaderProps({ ...defaultReaderProps, open: false});
      if (!state) return;
      const withReaderContent = { reader:getParty(state.reader)
      };
      await 
      ledger.exercise(Company.CreateReader, companyContractId, withReaderContent)
      console.log("the state", state)
    };
    setReaderProps({...defaultReaderProps, open: true, onClose});
  };

  
  type CompanyType={
    owner:typeof party,
    operator:typeof party,
    company: {
      address: string,
      name: string,
      category:typeof CompanyCategory.Farm
    }, 
    readers:[]
  }
  type InputFieldsForNewCompany = Omit<CompanyType, "issuer">;
  const defaultnewCompanyProps : InputDialogProps<InputFieldsForNewCompany> = {
    open: false,
    title: "New Company",
    defaultValue: {
      owner: party,
      operator: party,
      company: {
        address: "",
        name: "",
        category:CompanyCategory.Farm
      }, 
      readers:[]
    },
    fields: {
      owner: {
        label: "Owner",
        type: "selection",
        items: ["BusinessOwner"],
      },
      operator: {
        label: "Operator",
        type: "selection",
        items: OperatorCategory.keys,
      },
      company: {
        label:"Entreprise",
        type: "other",
        content: {
          name:"name",
          address:"address",
          category:{
            label: "Operator",
            type: "selection",
            items: CompanyCategory.keys,
          }
        }
      },
      readers:{
        label: "readers",
        type: "selection",
        items: [],
      },
    },
    onClose: async function() {}
  };
  const [newCompanyProps, setNewCompanyProps] = useState(defaultnewCompanyProps);
  function showNewAsset() {
    async function onClose(state : InputFieldsForNewCompany | null) {
      setNewCompanyProps({ ...defaultnewCompanyProps, open: false});
      if (!state) return;
      const withIssuer = { ...state, issuer: party , owner: getParty(state.owner), operator: getParty(state.operator),
      code:(companies.contracts.length).toString(),readers:partiesNames
      };
      await ledger.create(Company, withIssuer);
    };
    setNewCompanyProps({...defaultnewCompanyProps, open: true, onClose});
  };

  function displayCreateButon(){
    if(getName(party)==="BusinessOwner")
      {
        return(
          <Button color="primary" size="small"  className={classes.choiceButton} variant="contained" onClick={() => showNewAsset()}>
            Create Company 
          </Button>
        )
      }
  }

  return (
    <>
      <InputDialog { ...newCompanyProps } />
      <InputDialog { ...harvestProps } />
      <InputDialog { ...readerProps } />
      {displayCreateButon()}
      {/* 
      
      <InputDialog { ...appraiseProps } />
      <InputDialog { ...newCompanyProps } />
      */}
      <Table size="small">
        <TableHead>
          <TableRow className={classes.tableRow}>
            <TableCell key={0} className={classes.tableCell}>Code</TableCell>
            <TableCell key={1} className={classes.tableCell}>Owner</TableCell>
            <TableCell key={2} className={classes.tableCell}>Responsable</TableCell>
            
            <TableCell key={3} className={classes.tableCell}>Nom</TableCell>
            <TableCell key={4} className={classes.tableCell}>Addresse</TableCell>
            <TableCell key={5} className={classes.tableCell}>Category</TableCell>
            <TableCell key={6} className={classes.tableCell}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {companies.contracts.map(a => (
            <TableRow key={a.contractId} className={classes.tableRow}>
              <TableCell key={0} className={classes.tableCell}>{a.payload.code}</TableCell>
              <TableCell key={1} className={classes.tableCell}>{getName(a.payload.owner)}</TableCell>
              <TableCell key={2} className={classes.tableCell}>{getName(a.payload.operator)}</TableCell>
              <TableCell key={3} className={classes.tableCell}>{a.payload.company.name}</TableCell>
              <TableCell key={4} className={classes.tableCell}>{a.payload.company.address}</TableCell>
              <TableCell key={5} className={classes.tableCell}>{a.payload.company.category}</TableCell>
              <TableCell key={6} className={classes.tableCellButton}>
                  {(a.payload.operator === party && a.payload.company.category === "Farm")?
                  (
                    <Button color="primary" size="small" className={classes.choiceButton} variant="contained" disabled={a.payload.operator !== party} onClick={() => createHarvest(a.contractId)}>Harvest</Button>
                  ):""
                } 
                {/*<Button color="primary" size="small" className={classes.choiceButton} variant="contained" disabled={a.payload.owner !== party} onClick={() => createReader(a.contractId)}>reader</Button>*/}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
