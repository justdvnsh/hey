import type { Profile } from '@hey/lens';

import { PUSH_ENV } from '@hey/data/constants';
import formatAddress from '@hey/lib/formatAddress';
import { Button, Image } from '@hey/ui';
import cn from '@hey/ui/cn';
import { getLatestMessagePreviewText } from '@lib/getLatestMessagePreviewText';
import { chat } from '@pushprotocol/restapi';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useGlobalModalStateStore } from 'src/store/non-persisted/useGlobalModalStateStore';
import useMessageStore from 'src/store/persisted/useMessageStore';
import useProfileStore from 'src/store/persisted/useProfileStore';
import { useAccount, useWalletClient } from 'wagmi';

import Search from '../Shared/Navbar/Search';
import ChatListItemContainer from './ChatContainer';
import { ChatShimmer } from './ChatShimmer';

const ChatView = () => {
  const [selectedProfile, setSelectedProfile] = useState<any>();
  const currentProfile = useProfileStore((state) => state.currentProfile);

  const currentProfileUniqueChatIdentifier = `nft:eip155:${currentProfile?.ownedBy.chainId}:${currentProfile?.ownedBy.address}:${currentProfile?.id}`;

  const pgpPvtKey = useMessageStore((state) => state.pgpPvtKey);
  const { data: signer } = useWalletClient();

  // Helps to check if the wallet is enabled or not
  const { status } = useAccount();
  const { refresh } = useRouter();

  const [activeTab, setActiveTab] = useState('chats'); // Default to 'chats'

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const setShowMessageRequestModal = useGlobalModalStateStore(
    (state) => state.setShowMessageRequestModal
  );

  const baseConfig = useMemo(() => {
    return {
      account: signer?.account.address ?? '',
      env: PUSH_ENV,
      pgpPrivateKey: pgpPvtKey,
      toDecrypt: true
    };
  }, [signer, pgpPvtKey]);

  const { data: chats, isLoading: fetchingChats } = useQuery({
    enabled: !!signer?.account,
    queryFn: async () => {
      return await chat.chats(baseConfig);
    },
    queryKey: ['get-chats']
  });

  const { data: requests, isLoading: fetchingRequests } = useQuery({
    enabled: !!signer?.account,
    queryFn: async () => {
      return await chat.requests(baseConfig);
    },
    queryKey: ['get-pending-requests']
  });

  const isChatsLoading = fetchingRequests || fetchingChats;

  const allChats = useMemo(() => {
    if (isChatsLoading) {
      return [];
    }

    if (!chats || !requests) {
      return [];
    }

    const requestChats = requests?.map((item) => ({
      ...item,
      type: 'request'
    }));
    const normalChats = chats?.map((item) => ({
      ...item,
      type: 'chat'
    }));
    return [...normalChats, ...requestChats];
  }, [chats, isChatsLoading, requests]);

  // we are allowing chat between profiles
  /*
   * 1. Currently chat between wallets is not going to be supported
   * 2. Chat between profiles is going to be supported
   * 3. format for in-profile chats : // nft:eip155:${nftChainId}:${nftContractAddress}:${nftTokenId}
   */
  const onProfileSelected = async (profile: Profile) => {
    console.log(profile);
    console.log(currentProfile);

    // -> if user selected their own profile, only then chatting is allowed
    // This logic can also be changed to chat with multiple wallets (users) and not only profiles
    // if (profile.ownedBy.address === currentProfile.ownedBy.address) {

    //   // 1. Create the chatting account unique identifier for the profiles
    //   const selectedProfileUniqueChatIdentifier = `nft:eip155:${profile.ownedBy.chainId}:${profile.ownedBy.address}:${profile.id}`

    //   // -> If currentProfile and selectedProfile's unique chat identifier is same
    //   if (currentProfileUniqueChatIdentifier === selectedProfileUniqueChatIdentifier) return

    //   if (allChats.length == 0) {
    //     setShowMessageRequestModal(true, profile)
    //   } else {
    //     // 2. If user selects someone from current chat list or requests - open their chat
    //     allChats.map((chat) => {
    //       if (profile.ownedBy.address === chat.wallets?.split(':').pop() ?? '') {
    //         const profile = {
    //           address: chat.wallets?.split(':').pop() ?? '',
    //           did: chat.wallets,
    //           handle: chat.name,
    //           isRequestProfile: chat.type === 'request',
    //           threadhash: chat.threadhash
    //         };
    //         setSelectedProfile(profile)
    //       } else {
    //         // 3. if user selects someone not in their contact - open modal to send request
    //         setShowMessageRequestModal(true, profile)
    //       }
    //     })
    //   }
    // }

    if (profile.id === currentProfile?.id) {
      return;
    }

    if (profile.ownedBy.address !== currentProfile?.ownedBy.address) {
      if (allChats.length == 0) {
        setShowMessageRequestModal(true, profile);
      } else {
        // 2. If user selects someone from current chat list or requests - open their chat
        allChats.map((chat) => {
          console.log(chat);
          if (
            profile.ownedBy.address === chat.wallets?.split(':').pop() ??
            ''
          ) {
            const profile = {
              address: chat.wallets?.split(':').pop() ?? '',
              did: chat.wallets,
              handle: chat.name,
              isRequestProfile: chat.type === 'request',
              profilePic: chat.profilePicture,
              threadhash: chat.threadhash
            };
            console.log(`Chat Profile : ${profile.address} : ${profile.did}`);
            setSelectedProfile(profile);
          } else {
            // 3. if user selects someone not in their contact - open modal to send request
            setShowMessageRequestModal(true, profile);
          }
        });
      }
    }
  };

  if (status !== 'connected') {
    return (
      <div className="page-center flex flex-col">
        <h2 className="text-2xl">Your wallet is not connected!</h2>
        <p className="my-2 text-sm">
          Please unlock your wallet and refresh the page
        </p>
        <Button onClick={refresh}>Refresh</Button>
      </div>
    );
  }

  // if (!isChatsLoading && allChats.length === 0) {
  //   return (
  //     <div className="min-w-screen-xl container m-auto flex min-h-[-webkit-calc(100vh-65px)] flex-col items-center justify-center bg-white">
  //       <h2 className="text-2xl">Didn't chat yet!</h2>
  //       <p className="text-sm text-gray-500">
  //         Looks like you haven't started any conversation
  //       </p>
  //       <Button className="my-4" size="lg">
  //         New message
  //       </Button>
  //       <Search onProfileSelected={onProfileSelected} />
  //     </div>
  //   );
  // }

  return (
    <>
      <div className="mx-8 my-4">
        <div className="w-full h-full mx-auto sm:px-6 lg:px-8 lg:px-52">
          <div className="h-full flex items-start justify-between space-x-6">
            <div className="w-1/4 h-full flex-col items-start justify-between overflow-y-auto">
              <Search onProfileSelected={onProfileSelected} />
              <div className="mt-3 flex gap-3 w-full justify-center">
                <button
                  aria-label="chats"
                  className={cn(
                    { '!bg-brand-500 !text-white': activeTab === 'chats' },
                    'text-brand-500 rounded-full px-3 py-1.5 text-sm sm:px-4',
                    'border-brand-300 dark:border-brand-500 border',
                    'bg-brand-100 dark:bg-brand-300/20'
                  )}
                  onClick={() => {
                    handleTabChange('chats');
                  }}
                  type="button"
                >
                  Chats
                </button>
                <button
                  aria-label="requests"
                  className={cn(
                    { '!bg-brand-500 !text-white': activeTab === 'requests' },
                    'text-brand-500 rounded-full px-3 py-1.5 text-sm sm:px-4',
                    'border-brand-300 dark:border-brand-500 border',
                    'bg-brand-100 dark:bg-brand-300/20'
                  )}
                  onClick={() => {
                    handleTabChange('requests');
                  }}
                  type="button"
                >
                  Requests
                </button>
              </div>
              {isChatsLoading ? (
                <ChatShimmer />
              ) : (
                <>
                  {activeTab === 'chats' &&
                    chats?.map((chat) => {
                      const profile = {
                        address: chat.wallets?.split(':').pop() ?? '',
                        did: chat.wallets,
                        handle: chat.name,
                        isRequestProfile: false,
                        profilePic: chat.profilePicture,
                        threadhash: chat.threadhash
                      };
                      return (
                        <div
                          className="mb-2 cursor-pointer p-4"
                          key={chat.chatId}
                          onClick={() => {
                            if (
                              !selectedProfile ||
                              selectedProfile.address !== profile.address
                            ) {
                              setSelectedProfile(profile);
                            }
                          }}
                        >
                          <div className="flex">
                            <Image
                              alt={chat.chatId}
                              className="mr-2 h-10 w-10 cursor-pointer rounded-full border dark:border-gray-700"
                              src={chat.profilePicture ?? ''}
                            />
                            <div className="w-3/4" key={chat.chatId}>
                              <p>
                                {chat.name
                                  ? chat.name
                                  : formatAddress(
                                      chat?.wallets?.split?.(':')?.pop() ?? ''
                                    )}
                              </p>
                              <p className="truncate text-sm text-gray-400">
                                {getLatestMessagePreviewText(chat.msg as any)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {activeTab === 'requests' &&
                    requests?.map((chat) => {
                      const profile = {
                        address: chat.wallets?.split(':').pop() ?? '',
                        did: chat.wallets,
                        handle: chat.name,
                        isRequestProfile: true,
                        profilePic: chat.profilePicture,
                        threadhash: chat.threadhash
                      };
                      return (
                        <div
                          className="mb-2 cursor-pointer p-4"
                          key={chat.chatId}
                          onClick={() => {
                            if (
                              !selectedProfile ||
                              selectedProfile.address !== profile.address
                            ) {
                              setSelectedProfile(profile);
                            }
                          }}
                        >
                          <div className="flex">
                            <Image
                              alt={chat.chatId}
                              className="mr-2 h-10 w-10 cursor-pointer rounded-full border dark:border-gray-700"
                              src={chat.profilePicture ?? ''}
                            />
                            <div className="w-3/4" key={chat.chatId}>
                              <p>
                                {chat.name
                                  ? chat.name
                                  : formatAddress(
                                      chat?.wallets?.split?.(':')?.pop() ?? ''
                                    )}
                              </p>
                              <p className="truncate text-sm text-gray-400">
                                {getLatestMessagePreviewText(chat.msg as any)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </>
              )}
            </div>
            <div className="w-3/4 h-full flex-col items-start justify-between border-l">
              {selectedProfile ? (
                <ChatListItemContainer profile={selectedProfile} />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <h2 className="text-2xl">Select a message</h2>
                  <p className="text-sm text-gray-500">
                    Choose from your existing conversations, start a new one, or
                    just keep swimming.
                  </p>
                  <Button className="my-4" size="lg">
                    New message
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/*<GridLayout className="border-x-[1px] bg-white p-0 sm:p-0" classNameChild="lg:gap-0">
      <GridItemFour className="border-r">
        <div className="p-4 border-b">
          <Search onProfileSelected={onProfileSelected} />
          <div className="mt-3 flex gap-3 w-full justify-center">
            <button
              aria-label='chats'
              className={cn(
                { '!bg-brand-500 !text-white': activeTab === 'chats' },
                'text-brand-500 rounded-full px-3 py-1.5 text-sm sm:px-4',
                'border-brand-300 dark:border-brand-500 border',
                'bg-brand-100 dark:bg-brand-300/20'
              )}
              onClick={() => {
                handleTabChange('chats')
              }}
              type="button"
            >
              Chats
            </button>
            <button
              aria-label='requests'
              className={cn(
                { '!bg-brand-500 !text-white': activeTab === 'requests' },
                'text-brand-500 rounded-full px-3 py-1.5 text-sm sm:px-4',
                'border-brand-300 dark:border-brand-500 border',
                'bg-brand-100 dark:bg-brand-300/20'
              )}
              onClick={() => {
                handleTabChange('requests')
              }}
              type="button"
            >
              Requests
            </button>
          </div>
        </div>
        {isChatsLoading ? (
          <ChatShimmer />
        ) : (
          <>
            {activeTab === "chats" && chats.map((chat) => {
              const profile = {
                address: chat.wallets?.split(':').pop() ?? '',
                did: chat.wallets,
                handle: chat.name,
                isRequestProfile: false,
                threadhash: chat.threadhash
              };
              return (
                <div
                  className="mb-2 cursor-pointer p-4"
                  key={chat.chatId}
                  onClick={() => {
                    if (
                      !selectedProfile ||
                      selectedProfile.address !== profile.address
                    ) {
                      setSelectedProfile(profile);
                    }
                  }}
                >
                  <div className="flex">
                    <Image
                      alt={chat.chatId}
                      className="mr-2 h-10 w-10 cursor-pointer rounded-full border dark:border-gray-700"
                      src={chat.profilePicture ?? ''}
                    />
                    <div className="w-3/4" key={chat.chatId}>
                      <p>
                        {chat.name
                          ? chat.name
                          : formatAddress(
                              chat?.wallets?.split?.(':')?.pop() ?? ''
                            )}
                      </p>
                      <p className="truncate text-sm text-gray-400">
                        {getLatestMessagePreviewText(chat.msg as any)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {activeTab === "requests" && requests.map((chat) => {
              const profile = {
                address: chat.wallets?.split(':').pop() ?? '',
                did: chat.wallets,
                handle: chat.name,
                isRequestProfile: true,
                threadhash: chat.threadhash
              };
              return (
                <div
                  className="mb-2 cursor-pointer p-4"
                  key={chat.chatId}
                  onClick={() => {
                    if (
                      !selectedProfile ||
                      selectedProfile.address !== profile.address
                    ) {
                      setSelectedProfile(profile);
                    }
                  }}
                >
                  <div className="flex">
                    <Image
                      alt={chat.chatId}
                      className="mr-2 h-10 w-10 cursor-pointer rounded-full border dark:border-gray-700"
                      src={chat.profilePicture ?? ''}
                    />
                    <div className="w-3/4" key={chat.chatId}>
                      <p>
                        {chat.name
                          ? chat.name
                          : formatAddress(
                              chat?.wallets?.split?.(':')?.pop() ?? ''
                            )}
                      </p>
                      <p className="truncate text-sm text-gray-400">
                        {getLatestMessagePreviewText(chat.msg as any)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </GridItemFour>
      <GridItemEight>
        {selectedProfile ? (
          <ChatListItemContainer profile={selectedProfile} />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-2xl">Select a message</h2>
            <p className="text-sm text-gray-500">
              Choose from your existing conversations, start a new one, or just
              keep swimming.
            </p>
            <Button className="my-4" size="lg">
              New message
            </Button>
          </div>
        )}
      </GridItemEight>
    </GridLayout>*/}
    </>
  );
};

export default ChatView;
