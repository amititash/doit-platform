// in src/App.js
import React from 'react';
import { Admin, Resource } from 'react-admin';
import { UserList } from './users';
// import jsonServerProvider from 'ra-data-json-server';
// import jsonServerProvider from './latestDataProvider';
import jsonServerProvider from './dataProvider'

const dataProvider = jsonServerProvider(`http://3.94.21.126:5544`);

// const dataProvider = jsonServerProvider('http://3.94.21.126:5544/logs?_end=10&_order=DESC&_sort=id&_start=0');



const App = () => (
    <Admin dataProvider={dataProvider}>
       <Resource name="logs" list={UserList} />
    </Admin>
);

export default App;
