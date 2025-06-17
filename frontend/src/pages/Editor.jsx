import DiagramEditor from "../components/DiagramEditor"
import { useEffect, useState } from "react"

export const Editor = () => {
    
    const [authToken , setAuthToken] = useState("");
    useEffect(() => {
        const GeToken = () => {
            const token = localStorage.getItem("token");
            if( token ){
                setAuthToken(token);
            }
        }
        GeToken();
    },[]);

    return (
        <div>
            <DiagramEditor 
                authToken={authToken} 
            />
        </div>
    )
}
