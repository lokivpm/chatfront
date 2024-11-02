import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom'; 
import './DocumentChat.css'; 

function DocumentChat() {
    const location = useLocation(); 
    const { fileUrl, documentId } = location.state || {}; 
    const [fileContent, setFileContent] = useState(null); 
    const [questions, setQuestions] = useState([]); 
    const [userInput, setUserInput] = useState(''); 
    const [qaPairs, setQaPairs] = useState([]); 

    useEffect(() => {
        const fetchFileContent = async () => {
            if (fileUrl) {
                try {
                    const response = await fetch(fileUrl);
                    if (response.ok) {
                        const contentType = response.headers.get("Content-Type");
                        if (contentType.startsWith('text/')) { 
                            const text = await response.text(); 
                            setFileContent(text); 
                        } else if (contentType === 'application/pdf') {
                            setFileContent(<iframe src={fileUrl} width="100%" height="650px" title="Document Viewer"></iframe>);
                        } else {
                            setFileContent(<p>Unsupported file type: {contentType}</p>);
                        }
                    } else {
                        console.error('Error fetching file content:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error fetching file content:', error);
                }
            }
        };
        
        fetchFileContent();
    }, [fileUrl]);

    const handleQuestionSubmit = async (e) => {
        e.preventDefault();
    
        if (!userInput || !documentId) {
            console.error('Missing user input or document ID');
            return; 
        }
    
        setQuestions((prevQuestions) => [...prevQuestions, userInput]);
    
        try {
            const response = await fetch(`${process.env.REACT_APP_FAST_API}/query-document/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    document_id: documentId,
                    question: userInput,
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error fetching answer:', errorData);
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
            setQaPairs((prevPairs) => [...prevPairs, { question: userInput, answer: data.answer }]); // Store question and answer together
        } catch (error) {
            console.error('Error fetching answer:', error);
            setQaPairs((prevPairs) => [...prevPairs, { question: userInput, answer: 'Error fetching answer, please try again.' }]);
        }
    
        setUserInput('');
    };
    
    return (
        <div className="document-chat-container">
            <main className="main-content-ai">
                <div className="content-split">
                    <div className="file-viewer">
                        <h3>Document Viewer</h3>
                        {fileContent ? (
                            <div>{fileContent}</div> 
                        ) : (
                            <p>Click the document to upload</p>
                        )}
                    </div>
                    <div className="qa-section">
                        <h3>Ask a Question</h3>
                        <div className="chat-log">
                            {qaPairs.map((pair, index) => (
                                <div key={index} className="chat-item">
                                    <div className="question">
                                        <strong>Q:</strong> {pair.question}
                                    </div>
                                    <div className="answer">
                                        <strong>A:</strong> {pair.answer}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleQuestionSubmit} className="chat-input-form">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Type your question here"
                                required
                                className="chat-input"
                            />
                            <button type="submit" className="send-button">Send</button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default DocumentChat;
