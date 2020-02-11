/** @jsx jsx */

import Review from "./Review";
import {css, jsx} from "@emotion/core";
import PropTypes from "prop-types";

function PlanReviews(props) {

  const style = css`
    margin: 50px auto;
    text-align: center;
    width: 100%;
  `;

  if (props.loading) {
    return (
      <div className="plan-reviews" css={style} />
    );
  } else {
    return (
      <div className="plan-reviews" css={style}>
        <h2>History</h2>
        <Review key={0} userId={props.userId} status={2} time={props.planCreated}
          userName={props.studentName}/>

        {props.reviews.length ? props.reviews.map((review) => (
          <Review key={review.planId + "-" + review.advisorId} userId={review.advisorId}
            status={review.newStatus} time={review.timeReviewed}
            userName={review.firstName + " " + review.lastName} />
        )) : null}
      </div>
    );
  }

}
export default PlanReviews;

PlanReviews.propTypes = {
  loading: PropTypes.bool,
  reviews: PropTypes.array,
  userId: PropTypes.number,
  status: PropTypes.number,
  planCreated: PropTypes.any
};