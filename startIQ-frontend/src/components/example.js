import React from 'react';
import { Accordion , Card, Button } from 'react-bootstrap'
import { useAccordionToggle } from 'react-bootstrap/AccordionToggle';



const Acc = (props) => {


    const decoratedOnClick = useAccordionToggle(eventKey, onClick);

    console.log(decoratedOnClick);
    return (
        <div className="container">
                        <div className="row">
                            <div className="col-md-12">
                                <Accordion defaultActiveKey="0">
                                    <Card>
                                        <Card.Header>
                                        <Accordion.Toggle as={Button} variant="link" eventKey="0" >
                                            Click me!
                                        </Accordion.Toggle>
                                        </Card.Header>    
                                        <Accordion.Collapse eventKey="0">
                                        <Card.Body>Hello! I'm the body</Card.Body>
                                        </Accordion.Collapse>
                                    </Card>
                                    <Card>
                                        <Card.Header>
                                        <Accordion.Toggle as={Button} variant="link" eventKey="1">
                                            Click me!
                                        </Accordion.Toggle>
                                        </Card.Header>
                                        <Accordion.Collapse eventKey="1">
                                        <Card.Body>Hello! I'm another body</Card.Body>
                                        </Accordion.Collapse>
                                    </Card>
                                </Accordion>
                            </div>
                        </div>
                    </div>
    )
}

export default Acc;