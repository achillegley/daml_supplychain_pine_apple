import React, { useState } from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Fade from "@material-ui/core/Fade";
import MenuItem from "@material-ui/core/MenuItem";
import { useUserDispatch, loginUser } from "../../context/UserContext";
import useStyles from "./styles";
import logo from "./logo.svg";

const Login = (props : RouteComponentProps) => {
  var classes = useStyles();
  var userDispatch = useUserDispatch();
  var [isLoading, setIsLoading] = useState(false);
  var [error, setError] = useState(false);
  var [loginValue, setLoginValue] = useState("");
  var [passwordValue, setPasswordValue] = useState("");


  let types=[
    {
      name:"Certificate Officer",
      value:"CertificateOfficer",
    },
    {
      name:"Transport Company Operator",
      value:"TransportCompanyOperator",
    },
    {
      name:"Processing Company Operator",
      value:"ProcessingCompanyOperator",
    }
    ,
    {
      name:"Warehouse Operator",
      value:"WarehouseOperator",
    },
    {
      name:"Farmer Operator",
      value:"FarmerOperator",
    },
    {
      name:"Business Owner",
      value:"BusinessOwner",
    }
  ]

  return (
    <Grid container className={classes.container}>
      <div className={classes.logotypeContainer}>
        <img src={logo} alt="logo" className={classes.logotypeImage} />
        <Typography className={classes.logotypeText}>FIRSTY SUPPLYCHAIN</Typography>
      </div>
      <div className={classes.formContainer}>
        <div className={classes.form}>
            <React.Fragment>
              <Fade in={error}>
                <Typography color="secondary" className={classes.errorMessage}>
                  Something is wrong with your login or password :(
                </Typography>
              </Fade>
              {/*
              <FormControl  fullWidth>
              <Select
                  id="email"
                  value={loginValue}
                  //onChange={e => setLoginValue()}
                  onChange={e => setPasswordValue(e.target.value)}
                  defaultValue={""}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      loginUser(
                        userDispatch,
                        loginValue,
                        passwordValue,
                        props.history,
                        setIsLoading,
                        setError,
                      )
                    }
                  }}
                  //margin="normal"
                  placeholder="Username"
                  type="select"
                  fullWidth
                  >
                  {types.map(item => (<MenuItem key={item} value={item}>{item}</MenuItem>))}
              </Select>
              </FormControl>
              */}
              <Typography color="primary" className={classes.textFieldUnderline}>
                  Login as
              </Typography>
              <select 
                id="email"
                value={loginValue} 
                onChange={e => setLoginValue(e.target.value)}
              >
                {types.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
              {/*<TextField
                id="email"
                InputProps={{
                  classes: {
                    underline: classes.textFieldUnderline,
                    input: classes.textField,
                  },
                }}
                value={loginValue}
                onChange={e => setLoginValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    loginUser(
                      userDispatch,
                      loginValue,
                      passwordValue,
                      props.history,
                      setIsLoading,
                      setError,
                    )
                  }
                }}
                margin="normal"
                placeholder="Username"
                type="email"
                disabled={true}
                fullWidth
              />*/}
              {/*
              <TextField
                id="password"
                InputProps={{
                  classes: {
                    underline: classes.textFieldUnderline,
                    input: classes.textField,
                  },
                }}
                value={passwordValue}
                onChange={e => setPasswordValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    loginUser(
                      userDispatch,
                      loginValue,
                      passwordValue,
                      props.history,
                      setIsLoading,
                      setError,
                    )
                  }
                }}
                margin="normal"
                placeholder="Password"
                type="password"
                fullWidth
              />*/}
              <div className={classes.formButtons}>
                {isLoading ?
                  <CircularProgress size={26} className={classes.loginLoader} />
                : <Button
                    disabled={loginValue.length === 0}
                    onClick={() =>
                      loginUser(
                        userDispatch,
                        loginValue,
                        passwordValue,
                        props.history,
                        setIsLoading,
                        setError,
                      )
                    }
                    variant="contained"
                    color="primary"
                    size="large"
                  >
                    Login
                  </Button>}
              </div>
            </React.Fragment>
        </div>
      </div>
    </Grid>
  );
}

export default withRouter(Login);
