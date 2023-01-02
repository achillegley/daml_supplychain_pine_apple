import React, { useState } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";

export interface RegularField {
  label : string
  type : "text" | "number" | "date"  
}

export interface SelectionField {
  label : string
  type : "selection"
  items : string[]
}

export interface ProductSelectionField {
  label : string
  type : "product_selection"
  items : {cid:string,label:string}[]
}

export interface CustomField {
  label : string
  type : "other"
  content : { name: string, address: string, category: {
    label : string
    type : "selection"
    items : string[]
  } }
}


export type Field = RegularField | SelectionField | CustomField | ProductSelectionField

export interface InputDialogProps<T extends {[key: string]: any }> {
  open : boolean
  title : string
  defaultValue : T
  fields : Record<keyof T, Field>
  onClose : (state : T | null) => Promise<void>
}

export function InputDialog<T extends { [key : string] : any }>(props : InputDialogProps<T>) {
  const [ state, setState ] = useState<T>(props.defaultValue);

  function fieldsToInput([fieldName, field] : [string, Field], index : number) : JSX.Element {
    if(field.type==="product_selection")
    {
      return (
        <FormControl key={index} fullWidth>
          <InputLabel required>{field.label}</InputLabel>
          <Select
              defaultValue={""}
              onChange={e => setState({ ...state, [fieldName]: e.target.value })}>
            {field.items.map(item => (<MenuItem key={item.label} value={item.cid}>{item.label}</MenuItem>))}
          </Select>
        </FormControl>
      )

    }
    if (field.type === "selection") {
      return (
        <FormControl key={index} fullWidth>
          <InputLabel required>{field.label}</InputLabel>
          <Select
              value={state[fieldName]}
              defaultValue={""}
              onChange={e => setState({ ...state, [fieldName]: e.target.value })}>
            {field.items.map(item => (<MenuItem key={item} value={item}>{item}</MenuItem>))}
          </Select>
        </FormControl>
      )
    } else {
      if(field.type === "other")
      {
        return(          
          <FormControl key={index} fullWidth>
              <br/>
              <InputLabel required>{"Categorie"}</InputLabel>
              <Select
                  value={state["category"]}
                  defaultValue={""}
                  onChange={e => setState({ ...state, ["company"]: {...state.company,category:e.target.value} })}>
                {field.content.category.items.map(item => (<MenuItem key={item} value={item}>{item}</MenuItem>))}
              </Select>

              <br/>
              <TextField
              required
              autoFocus
              fullWidth
              key={"name_"+index}
              label="name"
              type="text"
              onChange={e => setState({ ...state, ["company"]: {...state.company,name:e.target.value} })}
              InputLabelProps={{
                shrink:true,
                required:true,
              }}
            />
            <br/>
            <TextField
              required
              autoFocus
              fullWidth
              key={"adresse_"+index}
              label="addresse"
              type="text"
              onChange={e => setState({ ...state, ["company"]: {...state.company,address:e.target.value} })}
              InputLabelProps={{
                shrink:true,
                required:true,
              }}
            />
            <br/>
            </FormControl>
        )
      }
      else{
        return (
          <FormControl key={index} fullWidth>
          <br/>
          <TextField
            required
            autoFocus
            fullWidth
            key={index}
            label={field.label}
            type={field.type}
            onChange={e => setState({ ...state, [fieldName]: e.target.value })}
            InputLabelProps={{
              shrink:true,
              required:true,
            }}
            placeholder={(field.type==="date")?"YYYY-MM-DD":""}
          />
          <br/>
          </FormControl>
        )
      }
    }
  }
  const fieldsAsArray : [string, Field][] = Object.entries(props.fields);

  return (
    <Dialog open={props.open} onClose={() => props.onClose(null)} maxWidth="sm" fullWidth>
      <DialogTitle>
        {props.title}
      </DialogTitle>
      <DialogContent>
        {fieldsAsArray.map((value, index) => fieldsToInput(value, index))}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => props.onClose(null)} color="primary">
          Cancel
        </Button>
        <Button onClick={() => props.onClose(state)} color="primary">
          Okay
        </Button>
      </DialogActions>
    </Dialog>
  );
}