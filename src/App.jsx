import { useState } from 'react';
import { io } from "socket.io-client";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Spinner from 'react-bootstrap/Spinner';
import { useEffect } from 'react';

// Styles
const styles = {
    mainContainer: {
        background: '#fafafa',
        minHeight: '100vh'
    }
}

// =============================================================================
// Main Entry Point
// =============================================================================
const App = () => {
    // Various App States
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([])

    // Once Connected to socket, start listening to events
    const setupListener = () => {
        socket.onAny((event, data) => {
            setMessages((prev) => [...prev, {
                timestamp: new Date().toString().split(' ').splice(0,5).join(' '),
                type: event,
                message: data
            }])
        });
    }

    // Only runs when a change in socket happens
    useEffect(() => {
        if(socket){
            socket.on('connect', () => {
                setIsLoading(false);
                setIsConnected(true);
                setupListener();
            });

            socket.on('disconnect', () => {
                setMessages([]);
                setSocket(null);
                setIsConnected(false);
            });

            socket.on('connect_failed', (error) => {
                alert(error)
                setIsLoading(false)
                setSocket(null);
            });
            socket.on('connect_error', (error) => {
                alert(error)
                setIsLoading(false)
                setSocket(null);
            });

            socket.on('error', (error) => {
                alert('Error Connecting', error);
                setIsLoading(false);
                setSocket(null);
            })
        }
    }, [socket])

    // Render
    return (
        <main style={styles.mainContainer}>
            <Container className="py-4">
                <Row className="gap-4">
                    <Col xs={12}>
                        <SearchArea socket={socket} setSocket={setSocket} isConnected={isConnected} setIsLoading={setIsLoading} isLoading={isLoading}/>
                    </Col>

                    <Col xs={12}>
                        <MessageDisplay messages={messages}/>
                    </Col>
                </Row>
            </Container>
        </main>

    )
}

// =============================================================================
// Search Bar Area
// =============================================================================
const SearchArea = ({ socket, setSocket, isConnected, isLoading, setIsLoading }) => {
    const [socketAddress, setSocketAddress] = useState('')
    
    const handleSubmit = e => {
        e.preventDefault();

        // Check if address is valid
        if(!socketAddress) {
            alert("Enter Valid Address")
            return
        }

        setIsLoading(true);
        setSocket(io(socketAddress, {reconnection: false, transports: ['websocket']}))
    }

    const handleDisconnect = (e) => {
        e.preventDefault();

        // Restore Defaults
        socket.disconnect();
        setSocketAddress('');
        setSocket(null);
    }

    return (
        <Card className="p-4">
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formSearch">
                    <Form.Label>Websocket Address</Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="Enter Socket Address.." 
                        value={socketAddress} 
                        onChange={e => setSocketAddress(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="d-flex gap-2 justify-content-end">
                    <Button variant="outline-danger" disabled={!isConnected} onClick={handleDisconnect}>Disconnect</Button>
                    <Button variant={isConnected ? "success" : "primary"} type="submit" disabled={isLoading}>
                        {
                            isLoading &&
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                                &nbsp;
                            </>
                        }

                        {
                            isConnected ? <span>&#10003; Connected </span> : <span>Connect</span>
                        }
                    </Button>
                </Form.Group>
            </Form>
        </Card>

    )
}

// =============================================================================
// Message Display Area
// =============================================================================
const MessageDisplay = ({messages}) => {
    return (
        <Card className="p-4">
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Message Type</th>
                        <th>Content</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        messages.map((message, index) => {
                            return (
                                <tr key={index}>
                                    <td>{message.timestamp}</td>  
                                    <td>{message.type}</td>
                                    <td>{JSON.stringify(message.message)}</td>  
                                </tr>
                            )
                        })
                    }

                </tbody>
            </Table>

            {
                messages.length === 0 && <p className="text-center">No Messages Yet</p>
            }
        </Card>
    )
}

export default App;
