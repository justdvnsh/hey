import type { AnyPublication, Profile } from '@hey/lens';

import { create } from 'zustand';

interface GlobalModalState {
  messagingProfile: null | Profile;
  reportingProfile: null | Profile;
  reportingPublication: AnyPublication | null;
  setShowAuthModal: (showAuthModal: boolean) => void;
  setShowDiscardModal: (showDiscardModal: boolean) => void;
  setShowInvitesModal: (showInvitesModal: boolean) => void;
  setShowMessageRequestModal: (
    showMessageRequestModal: boolean,
    messagingProfile: null | Profile
  ) => void;
  setShowMobileDrawer: (showMobileDrawer: boolean) => void;
  setShowNewPostModal: (showNewPostModal: boolean) => void;
  setShowProfileSwitchModal: (showProfileSwitchModal: boolean) => void;
  setShowPublicationReportModal: (
    showPublicationReportModal: boolean,
    reportingPublication: AnyPublication | null
  ) => void;
  setShowReportProfileModal: (
    reportProfileModal: boolean,
    reportingProfile: null | Profile
  ) => void;
  setShowWrongNetworkModal: (showWrongNetworkModal: boolean) => void;
  showAuthModal: boolean;
  showDiscardModal: boolean;
  showInvitesModal: boolean;
  showMessageRequestModal: boolean;
  showMobileDrawer: boolean;
  showNewPostModal: boolean;
  showProfileSwitchModal: boolean;
  showPublicationReportModal: boolean;
  showReportProfileModal: boolean;
  showWrongNetworkModal: boolean;
}

export const useGlobalModalStateStore = create<GlobalModalState>((set) => ({
  messagingProfile: null,
  reportingProfile: null,
  reportingPublication: null,
  setShowAuthModal: (showAuthModal) => set(() => ({ showAuthModal })),
  setShowDiscardModal: (showDiscardModal) => set(() => ({ showDiscardModal })),
  setShowInvitesModal: (showInvitesModal) => set(() => ({ showInvitesModal })),
  setShowMessageRequestModal: (showMessageRequestModal, messagingProfile) =>
    set(() => ({ messagingProfile, showMessageRequestModal })),
  setShowMobileDrawer: (showMobileDrawer) => set(() => ({ showMobileDrawer })),
  setShowNewPostModal: (showNewPostModal) => set(() => ({ showNewPostModal })),
  setShowProfileSwitchModal: (showProfileSwitchModal) =>
    set(() => ({ showProfileSwitchModal })),
  setShowPublicationReportModal: (
    showPublicationReportModal,
    reportingPublication
  ) =>
    set(() => ({
      reportingPublication,
      showPublicationReportModal
    })),
  setShowReportProfileModal: (showReportProfileModal, reportingProfile) =>
    set(() => ({ reportingProfile, showReportProfileModal })),
  setShowWrongNetworkModal: (showWrongNetworkModal) =>
    set(() => ({ showWrongNetworkModal })),
  showAuthModal: false,
  showDiscardModal: false,
  showInvitesModal: false,
  showMessageRequestModal: false,
  showMobileDrawer: false,
  showNewPostModal: false,
  showProfileSwitchModal: false,
  showPublicationReportModal: false,
  showReportProfileModal: false,
  showWrongNetworkModal: false
}));
