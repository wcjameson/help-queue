import React from "react";
import Ticket from "./Ticket";
import PropTypes from "prop-types";
import { useSelector } from 'react-redux'
import { useFirestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase'


function TicketList(props) {
  // The useFirestoreConnect() hook comes from react-redux-firebase.
  // allows us to listen for changes to Firestore without using an HOC in a class component.
  useFirestoreConnect([
    { collection: 'tickets' }
  ]);

  // The useSelector() hook comes from react-redux.
  // allows us to extract data from a Redux store.
  const tickets = useSelector(state => state.firestore.ordered.tickets);

  // react-redux-firebase also offers a useful isLoaded() function.
  // isLoaded() and isEmpty() from react-redux-firebase allow us to check if a collection has been retrieved from Firestore.
  if (isLoaded(tickets)) {

    return (
      <React.Fragment>
        <hr />
        {tickets.map((ticket) => {
          return <Ticket
            whenTicketClicked={props.onTicketSelection}
            names={ticket.names}
            location={ticket.location}
            issue={ticket.issue}
            formattedWaitTime={ticket.formattedWaitTime}
            id={ticket.id}
            key={ticket.id} />
        })}
      </React.Fragment>
    );
  }else {
    return (
      <React.Fragment>
        <h3>Loading...</h3>
      </React.Fragment>
    )
  }
}

TicketList.propTypes = {
  // ticketList: PropTypes.object,
  onTicketSelection: PropTypes.func
};

export default TicketList;