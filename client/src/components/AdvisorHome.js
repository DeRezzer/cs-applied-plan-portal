/** @jsx jsx */

import NavBar from "./Navbar";
import {useEffect, useState} from "react";
import {css, jsx} from "@emotion/core";
import {withRouter} from "react-router-dom";
import PropTypes from "prop-types";
import BounceLoader  from "react-spinners/BounceLoader";


function AdvisorHome(props) {

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const style = css`
    .loader-container {
        visibility: ${loading ? "visible" : "hidden"};
        position: fixed;
        margin-left: -75px;
        margin-bottom: 75px;
        left: 50%;
        bottom: 50%;
        width: 0;
        height: 0;
        z-index: 99;
      }

    #plan-selection-container {
      position: relative;
      top: 75px;
    }

    .home-error-message-container {
      position: relative;
      top: 100px;
    }
    
    .advisor-plans-table {
      position: relative;
      top: 100px;
    }

  `;

  useEffect(() => {
    fetchPlans();
  }, [props.history]);

  async function fetchPlans() {
    try {
      setErrorMessage("");
      setLoading(true);
      const selectStatus = document.getElementById("select-status");
      const statusValue = selectStatus.options[selectStatus.selectedIndex].value;
      const server = `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}`;
      const getUrl = `http://${server}/plan/status/${statusValue}/1/1`;
      let obj = {};

      const results = await fetch(getUrl);
      setLoading(false);
      if (results.ok) {
        obj = await results.json();
        setPlans(obj.data);
      } else {
        // we got a bad status code. Show the error
        obj = await results.json();
        setErrorMessage(obj.error);
      }
    } catch (err) {
      // send to 500 page if a server error happens while fetching plan
      setErrorMessage("An internal server error occurred. Please try again later.");
    }
  }

  function renderStatus(status) {
    switch (status) {
      case 0:
        return "Rejected";
      case 1:
        return "Awaiting student changes";
      case 2:
        return "Awaiting review";
      case 3:
        return "Awaiting final review";
      case 4:
        return "Accepted";
      default:
        return "Undefined status";
    }
  }

  function goToPlan(plan) {
    window.location.href = `/viewPlan/${plan.planId}`;
  }

  return (
    <div css={style}>
      <div className="loader-container">
        <BounceLoader
          size={150}
          color={"orange"}
        />
      </div>
      <NavBar showSearch={true} searchContent={"Search for plans"}/>
      <div id="plan-selection-container">
        <select id="select-status" className="advisor-plan-select">
          <option value="5">Any</option>
          <option value="2">Awaiting Review</option>
          <option value="3">Awaiting final review</option>
          <option value="1">Awaiting student changes</option>
          <option value="4">Accepted</option>
          <option value="0">Rejected</option>
        </select>
        <select id="select-time" className="advisor-plan-select">
          <option value="true">Time Created</option>
          <option value="false">Time Updated</option>
        </select>
        <select id="select-order" className="advisor-plan-select">
          <option value="true">Ascending</option>
          <option value="false">Decending</option>
        </select>
        <button id="search-plan-status-button" onClick={() => { fetchPlans(); }}>
          Search
        </button>
      </div>
      <div className="home-error-message-container">{errorMessage}</div>
      <table className="advisor-plans-table">
        <tbody>
          <tr>
            <th className="student-plans-data">Name</th>
            <th className="student-plans-data">Status</th>
            <th className="student-plans-data">Created</th>
            <th className="student-plans-data">Updated</th>
          </tr>
          {plans ? plans.map(plan =>
            <tr key={plan.planId} onClick={() => goToPlan(plan)}>
              <td className="student-plans-data" key={plan.planId + "a"}>{plan.planName}</td>
              <td className="student-plans-data" key={plan.planId + "b"}>{renderStatus(plan.status)}</td>
              <td className="student-plans-data" key={plan.planId + "c"}>{plan.created}</td>
              <td className="student-plans-data" key={plan.planId + "d"}>{plan.lastUpdated}</td>

            </tr>) : null}
        </tbody>
      </table>
    </div>
  );
}
export default withRouter(AdvisorHome);

AdvisorHome.propTypes = {
  history: PropTypes.object
};