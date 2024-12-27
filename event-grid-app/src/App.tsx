import React, { useEffect, useState } from 'react';
import CallCompositeComponent from './CallCompositeComponent';
import { initializeIcons } from "@fluentui/react";
import './App.css';
import { createUserAndToken, UserAndToken } from './utils/server';
initializeIcons();

function App() {
  const [userAndToken, setUserAndToken] = useState<UserAndToken | null>(null);
  const [groupCallResponse, setGroupCallResponse] = useState<string | null>(null);

  useEffect(()=>{
    (async() =>{
      const response = await fetch('/token', {
        method: 'POST',
      });
      const data = await response.json();
      setUserAndToken(data);

      const groupCallConfig = await fetch('/groupId');
      const groupCallConfigJson = await groupCallConfig.json();
      setGroupCallResponse(groupCallConfigJson.groupId);
    })();
  }, []);

  if (userAndToken === null) {
    return <div>Loading...waiting for token</div>;
  }

  if (groupCallResponse === null) {
    return <div>Loading..waiting for group call.</div>;
  }

  const userId = userAndToken.userId;
  const token = userAndToken.token;
  const groupId = groupCallResponse;

  return (
    <div className="App">
      <CallCompositeComponent userId={userId} token={token} groupId={groupId} />
    </div>
  );
}

export default App;