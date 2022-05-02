import React from 'react';
import NewTicketForm from './NewTicketForm';
import TicketList from './TicketList';
import TicketDetail from './TicketDetail';
import EditTicketForm from './EditTicketForm';
import { connect } from 'react-redux';
import PropTypes from "prop-types";
import * as a from './../actions';
import Moment from 'moment';
import { withFirestore } from 'react-redux-firebase'

class TicketControl extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // formVisibleOnPage: false,
      selectedTicket: null,
      editing: false
    };
    // this.handleClick = this.handleClick.bind(this);
  }

  // componentDidUpdate() {
  //   console.log("component updated!");
  // }

  componentWillUnmount() {
    console.log('component unmounted');
    clearInterval(this.waitTimeUpdateTimer);
  }

  componentDidMount() {
    this.waitTimeUpdateTimer = setInterval(() =>
      this.updateTicketElapsedWaitTime(),
      60000
    );
  }

  //Every minute, this function will dispatch an action for every single ticket in the queue.
  // updateTicketElapsedWaitTime = () => {
  //   const { dispatch } = this.props;
  //   Object.values(this.props.mainTicketList).forEach(ticket => {
  //     const newFormattedWaitTime = ticket.timeOpen.fromNow(true);
  //     const action = a.updateTime(ticket.id, newFormattedWaitTime);
  //     dispatch(action);
  //   });
  // }

  handleAddingNewTicketToList = () => {
    const { dispatch } = this.props;
    const action = a.toggleForm();
    dispatch(action);
    // this.setState({ formVisibleOnPage: false }); Because Redux will be handling this slice of state, we won't be using React or setState() to take care of form visibility any longer.
  }

  handleEditingTicketInList = () => {
    this.setState({
      editing: false,
      selectedTicket: null
    });
  }

  handleChangingSelectedTicket = (id) => {
    // const selectedTicket = this.props.mainTicketList[id]
    //We can use Firestore's get() method to manually retrieve a collection or a subset of a collection.
    this.props.firestore.get({ collection: 'tickets', doc: id }).then((ticket) => { //returns a promise that returns a DocumentSnapshot that is a read only object
      const firestoreTicket = {
        names: ticket.get("names"),
        location: ticket.get("location"),
        issue: ticket.get("issue"),
        id: ticket.id
      } //We reconstruct a ticket and then set that object to the value of firestoreTicket, now we have a value to pass into selectedTicket
      this.setState({ selectedTicket: firestoreTicket });
    });
  }

  handleDeletingTicket = (id) => {
    this.props.firestore.delete({ collection: 'tickets', doc: id }); //We access Firestore via this.props.firestore. Then we call the delete() method
    this.setState({
      selectedTicket: null
    });
  }

  handleEditClick = () => {
    console.log("handleEditClick reached!");
    this.setState({ editing: true });
  }

  handleClick = () => {
    if (this.state.selectedTicket != null) {
      this.setState({
        // formVisibleOnPage: false,
        selectedTicket: null,
        editing: false
      });
    } else {
      const { dispatch } = this.props;
      const action = a.toggleForm();
      dispatch(action);
      // this.setState(prevState => ({
      //   formVisibleOnPage: !prevState.formVisibleOnPage,
      // }));
    }
  }

  render() {
    let currentlyVisibleState = null;
    let buttonText = null;

    if (this.state.editing) {
      currentlyVisibleState = <EditTicketForm ticket={this.state.selectedTicket} onClickingEdit={this.handleEditingTicketInList} />
      buttonText = "Return to Ticket List";
    } else if (this.state.selectedTicket != null) {
      currentlyVisibleState = <TicketDetail ticket={this.state.selectedTicket} onClickingDelete={this.handleDeletingTicket} onClickingEdit={this.handleEditClick} />
      buttonText = "Return to Ticket List";
    } else if (this.props.formVisibleOnPage) {
      currentlyVisibleState = <NewTicketForm onNewTicketCreation={this.handleAddingNewTicketToList} />;
      buttonText = "Return to Ticket List";
    } else {
      currentlyVisibleState = <TicketList /*ticketList={this.props.mainTicketList}*/ onTicketSelection={this.handleChangingSelectedTicket} />;  //this.state (which refers to a class component's state) and this.props (which refers to the props being passed into a component from a parent component or the Redux store)
      buttonText = "Add Ticket";
    }
    return (
      <React.Fragment>
        {currentlyVisibleState}
        <button onClick={this.handleClick}>{buttonText}</button>
      </React.Fragment>
    );
  }

}


const mapStateToProps = state => {
  return {
    // mainTicketList: state.mainTicketList, //mapping state slices to component props
    formVisibleOnPage: state.formVisibleOnPage
  }
}

TicketControl = connect(mapStateToProps)(TicketControl); //This ensures the TicketControl component has the mapStateToProps functionality when connect() redefines the component.

TicketControl.propTypes = {
  mainTicketList: PropTypes.object, //The mainTicketList in our Redux store is an object so we define it as that prop type.
  formVisibleOnPage: PropTypes.bool
};

export default withFirestore(TicketControl);
