import React from 'react';

const ContactRow = ({ contact }) => {
  return (
    <tr>
      <td>{contact.name}</td>
      <td>{contact.phoneNumber}</td>
      <td>{contact.email}</td>
    </tr>
  );
};

export default ContactRow;
