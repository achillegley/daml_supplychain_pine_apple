import React from "react";
import { Route, Switch, withRouter } from "react-router-dom";
import DamlLedger from "@daml/react";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import Report from "../../pages/report/Report";
import Company from "../../pages/company/Company";
import Harvest from "../../pages/harvest/Harvest";
import CHarvest from "../../pages/harvest/CertificateHarvest";
import Product from "../../pages/product/Product";
import BoardingRequest from "../../pages/boarding/BoardingRequest";
import Boarding from "../../pages/boarding/Boarding";
import Processing from "../../pages/processing/processing";
import DeliveryRequest  from "../../pages/delivery/deliveryRequest";
import Delivery  from "../../pages/delivery/delivery";
import { useUserState } from "../../context/UserContext";
import { wsBaseUrl, httpBaseUrl } from "../../config";
import useStyles from "./styles";


const Layout = () => {
  const classes = useStyles();
  const user = useUserState();
  console.log(user);
  if(!user.isAuthenticated){
    return null;
  } else {
    return (
      <DamlLedger party={user.party} token={user.token} httpBaseUrl={httpBaseUrl} wsBaseUrl={wsBaseUrl}>
        <div className={classes.root}>
            <>
              <Header />
              <Sidebar />
              <div className={classes.content}>
                <div className={classes.fakeToolbar} />
                <Switch>
                  <Route path="/app/report" component={Report} />
                  <Route path="/app/company" component={Company} />
                  <Route path="/app/harvest" component={Harvest} />
                  <Route path="/app/charvest" component={CHarvest} />
                  <Route path="/app/product" component={Product} />
                  <Route path="/app/boardingrequest" component={BoardingRequest} />
                  <Route path="/app/boarding" component={Boarding} />
                  <Route path="/app/deliveryRequest" component={DeliveryRequest} />
                  <Route path="/app/delivery" component={Delivery} />
                  <Route path="/app/processing" component={Processing} />
                </Switch>
              </div>
            </>
        </div>
      </DamlLedger>
    );
  }
}

export default withRouter(Layout);
