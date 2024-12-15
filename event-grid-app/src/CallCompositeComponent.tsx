import React, { useEffect } from 'react';
import { CallComposite, createAzureCommunicationCallAdapter, CallAdapter } from '@azure/communication-react';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';

interface CallCompositeComponentProps {
  userId: string;
  token: string;
  groupId: string;
}

const CallCompositeComponent = ({ userId, token, groupId }: CallCompositeComponentProps) => {
    const [adapter, setAdapter] = React.useState<CallAdapter | null>(null);

    useEffect(() => {
        const createAdapter = async () => {
          if (adapter) {
            return; 
          }
          else {
            const callAdapter = await createAzureCommunicationCallAdapter({
                userId: { communicationUserId: userId },
                credential: new AzureCommunicationTokenCredential(token),
                locator: { groupId },
                displayName: 'User'
              });
              setAdapter(callAdapter);
          }
        };
        createAdapter();

        return () => {
          (async () => {
            if(adapter !== null) {
              adapter.dispose();
  
            }
          })();
        }
      }, [adapter, groupId, token, userId]); // Empty dependencies array

  if (!adapter) {
    return <div>Loading...</div>;
    } else {
    return (
      <CallComposite adapter={adapter} />
    );
  }
};

export default CallCompositeComponent;