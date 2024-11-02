import { Routes,Route } from 'react-router-dom';
import Landing from './components/Home/Landing';
import Register from './components/User/Register';
import ChangePassword from './components/User/ChangePassword';
import DocumentChat from './components/Document/DocumentChat';
import Layout from './components/Layout';



function App() {
  return (
    <div className="App">
    <Routes>
    <Route path="/" element={<Layout />}>
    <Route index element={<Landing />} />
    <Route path="/register" element={ <Register/>} />

    <Route path="/document-chat" element={ <DocumentChat/>} />
    </Route>
    <Route path="/reset-password" element={ <ChangePassword/>} />
    </Routes>
    </div>
  );
}

export default App;

