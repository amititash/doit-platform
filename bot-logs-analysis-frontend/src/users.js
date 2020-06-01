// in src/users.js
import React from 'react';
import { List, Datagrid, TextField, EmailField } from 'react-admin';
import { Filter, ReferenceInput, SelectInput, TextInput} from 'react-admin';

const PostFilter = (props) => (
    <Filter {...props}>
        <TextInput label="EmailId" source="emailId" alwaysOn />
        <ReferenceInput label="Log" source="logId" reference="logs" allowEmpty>
            <SelectInput optionText="name" />
        </ReferenceInput>
    </Filter>
);


export const UserList = props => (
    <List filters={<PostFilter />} {...props}>
        <Datagrid rowClick="edit">
            <TextField source="timestamp" />
            <TextField source="message" />
            <TextField source="level" />
            <EmailField source="meta.userId" />
            <TextField source="meta.nature" />
            <TextField source="company.name" />
        </Datagrid>
    </List>
);
