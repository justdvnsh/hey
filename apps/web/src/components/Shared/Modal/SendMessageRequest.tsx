import { PaperAirplaneIcon } from '@heroicons/react/20/solid';
import { PUSH_ENV } from '@hey/data/constants';
import { Button } from '@hey/ui';
import { chat } from '@pushprotocol/restapi';
import { useMemo, useRef, useState } from 'react';
import { useGlobalModalStateStore } from 'src/store/non-persisted/useGlobalModalStateStore';
import useMessageStore from 'src/store/persisted/useMessageStore';
import { useWalletClient } from 'wagmi';
// import useProfileStore from 'src/store/persisted/useProfileStore';
// import { PushAPI } from '@pushprotocol/restapi';

const SendMessageRequest = () => {
  const pgpPvtKey = useMessageStore((state) => state.pgpPvtKey);
  const { data: signer } = useWalletClient();

  const baseConfig = useMemo(() => {
    return {
      account: signer?.account.address ?? '',
      env: PUSH_ENV,
      pgpPrivateKey: pgpPvtKey,
      toDecrypt: true
    };
  }, [signer, pgpPvtKey]);

  // const currentProfile = useProfileStore((state) => state.currentProfile);

  // const currentProfileUniqueChatIdentifier = `nft:eip155:${currentProfile.ownedBy.chainId}:${currentProfile.ownedBy.address}:${currentProfile.id}`

  const [message, setMessage] = useState('');

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const messagingProfile = useGlobalModalStateStore(
    (state) => state.messagingProfile
  );

  const setShowMessageRequestModal = useGlobalModalStateStore(
    (state) => state.setShowMessageRequestModal
  );

  const sendMessageInvite = async (message: string) => {
    // const messagingProfileUniqueChatIdentifier = `nft:eip155:${messagingProfile.ownedBy.chainId}:${messagingProfile.ownedBy.address}:${messagingProfile.id}`
    // console.log(messagingProfileUniqueChatIdentifier)
    return await chat
      .send({
        account: signer?.account.address ?? '',
        env: PUSH_ENV,
        message: { content: message, type: 'Text' },
        pgpPrivateKey: pgpPvtKey,
        signer: signer ?? undefined,
        to: messagingProfile?.ownedBy.address ?? ''
      })
      .then()
      .catch((error) => console.log(error));
  };

  return (
    <div className="p-5">
      <div className="space-y-5">
        <div className="space-y-1">
          <div className="text-xl font-bold">Send Message Invite.</div>
          <div className="ld-text-gray-500 text-sm">
            This user doesn't seem to be connected. Send a message invite to
            this user.
          </div>
        </div>
        <textarea
          autoFocus={true}
          className="block w-full resize-none border-0 bg-transparent py-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
          id="message"
          name="message"
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ex: We know each other from ..."
          ref={inputRef}
          rows={3}
          spellCheck
          value={message}
        />
        <div className="flex items-end">
          <Button
            className="flex h-10 items-center justify-center rounded-full border-none text-gray-400 hover:text-gray-500"
            onClick={() => {
              setShowMessageRequestModal(false, null);
            }}
            outline
            type="button"
          >
            Close
          </Button>
          <Button
            className="flex h-10 items-center justify-center rounded-full border-none text-gray-400 hover:text-gray-500"
            icon={
              <PaperAirplaneIcon
                aria-hidden="true"
                className="h-5 w-5 flex-shrink-0 text-[#EF4444]"
              />
            }
            onClick={() => {
              sendMessageInvite(message);
            }}
            outline
            type="button"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SendMessageRequest;
