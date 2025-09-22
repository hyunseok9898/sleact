import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, Outlet, useParams } from 'react-router';
import useSWR from 'swr';
import { AddButton, Channels, Chats, Header, LogOutButton, MenuScroll, ProfileImg, ProfileModal, RightMenu, WorkspaceButton, WorkspaceModal, WorkspaceName, Workspaces, WorkspaceWrapper } from '@layouts/Workspace/styles';
import gravatar from 'gravatar'
import Menu from '@components/Menu';
import { Link } from 'react-router-dom';
import { IChannel, IUser } from '@typings/db';
import { Button, Input, Label } from '@pages/SignUp/styles';
import Modal from '@components/Modal';
import useInput from '@hooks/useInput';
import { toast } from 'react-toastify';
import CreateChannelModal from '@components/CreateChannelModal';
import InviteWorkspaceModal from '@components/InviteWorkspaceModal';
import InviteChannelModal from '@components/InviteChannelModal';
import DMList from '@components/DMList';
import ChannelList from '@components/ChannelList';
import useSocket from '@hooks/useSocket';


const Workspace = () => {
  const [ showUserMenu, setShowUserMenu ] = useState(false);
  const [ showCreateWorkspaceModal, setShowCreateWorkspaceModal ] = useState(false);
  const [ showInviteWorkspaceModal, setShowInviteWorkspaceModal ] = useState(false);
  const [ showInviteChannelModal, setShowInviteChannelModal ] = useState(false);
  const [ showWorkspaceModal, setShowWorkspaceModal ] = useState(false);
  const [ showCreateChannelModal, setShowCreateChannelModal ] = useState(false);
  const [ newWorkspace, onChangeNewWorkspace, setNewWorkspace ] = useInput('')
  const [ newUrl, onChangeNewUrl, setNewUrl ] = useInput('')
  
  

  const { data: userData, error, mutate } = useSWR<IUser | false>('/api/users', fetcher, {
    dedupingInterval: 2000,
  });
  
  const { workspace, channel } = useParams<{ workspace: string, channel: string }>();
  const { data: channelData, mutate:mutateChannel } = useSWR<IChannel[]>(
    userData ? `/api/workspaces/${workspace}/channels` : null,
     fetcher);

  const { data: memberData } = useSWR<IUser[]>(
    userData ? `/api/workspaces/${workspace}/members` : null,
    fetcher,
  );

  const [socket, disconnect] = useSocket(workspace);
  
  useEffect(() => {
    if(channelData && userData && socket) {
         console.log(socket);
      socket.emit('login', {
        id: userData.id,
        channels: channelData.map((v) => v.id)
      })
    }
  }, [socket, channelData, userData])
  useEffect(() => {
    return() => {
      disconnect()
    }
  },[workspace, disconnect])
  
  const onLogout = useCallback(() => {
    axios.post('/api/users/logout', null, {
      withCredentials: true,
    })
    .then(() => {
      mutate(false, false);
    })
  }, [mutate])

  const onCloseUserProfile = useCallback((e: { stopPropagation: () => void; }) => {
     e.stopPropagation();
     setShowUserMenu(false);
  }, [])

  const onClickUserProfile = useCallback(() => {
    setShowUserMenu((prev) => !prev);
  }, [])

  const onClickCreateWorkspace = useCallback(() => {
    setShowCreateWorkspaceModal(true);
  }, [])

  const onCreateWorkspace = useCallback((e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!newWorkspace || !newWorkspace.trim()) return;
    if (!newUrl || !newUrl.trim()) return;
    axios.post('/api/workspaces', {
      workspace: newWorkspace,
      url: newUrl,
    }, {
      withCredentials: true,
    })
    .then(() => {
      mutate();
      setShowCreateWorkspaceModal(false);
      setNewWorkspace('');
      setNewUrl('');
    })
    .catch((error) => {
      console.dir(error);
      toast.error(error.response?.data, { position: 'bottom-center' })
    })
  }, [newWorkspace, newUrl]);

  const onCloseModal = useCallback(() => {
    setShowCreateWorkspaceModal(false);
    setShowCreateChannelModal(false);
    setShowInviteWorkspaceModal(false);
    setShowInviteChannelModal(false);
  }, [])

  const toggleWorkspaceModal = useCallback(() => {
    setShowWorkspaceModal((prev) => !prev);
  }, [])

  const onClickAddChannel = useCallback(() => {
    setShowCreateChannelModal(true);
  }, [])

  const onClickInviteWorkspace = useCallback(() => {
    setShowInviteWorkspaceModal(true);
  }, [])


  if (!userData) {
    return <Navigate to='/login'></Navigate>
  }

  return (
    <div>
    <Header>
      <RightMenu>
        <span onClick={onClickUserProfile}>
          <ProfileImg src={gravatar.url(userData.email, { s: '28px', d: 'retro' })} alt={userData.nickname}/>
          {showUserMenu && (
            <Menu style={{ right: 0, top: 38 }} show={showUserMenu} onCloseModal={onCloseUserProfile} closeButton={true}>
              <ProfileModal>
                <img src={gravatar.url(userData.email, { s: '36px', d: 'retro' })} alt={userData.nickname}></img>
              <div>
                <span id="profile-name">{userData.nickname}</span>
                <span id="profile-active">Active</span>
              </div>
              </ProfileModal>
              <LogOutButton onClick={onLogout}>로그아웃</LogOutButton>
            </Menu>
            )}
        </span>
      </RightMenu>
    </Header>
      <WorkspaceWrapper>
        <Workspaces>
          {(userData?.Workspaces?? []).map((ws) => {
            return (
              <Link key={ws.id} to={`/workspace/${123}/channel/일반`}>
                <WorkspaceButton>{ws.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
              </Link>
            )
          })}
          <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
        </Workspaces>
        <Channels>
          <WorkspaceName onClick={toggleWorkspaceModal}>Sleact</WorkspaceName>
          <MenuScroll>
            <Menu show={showWorkspaceModal} onCloseModal={toggleWorkspaceModal} style={{top : 95, left:80}} closeButton={true}>
              <WorkspaceModal>
                <h2>Sleact</h2>
                <button onClick={onClickInviteWorkspace}>워크스페이스에 사용자 초대</button>
                <button onClick={onClickAddChannel}>채널 만들기</button>
                <button onClick={onLogout}>로그아웃</button>
              </WorkspaceModal>
            </Menu>
            <ChannelList/>
            <DMList/>
          </MenuScroll>
        </Channels>
        <Chats>
          <Outlet />
        </Chats>
      </WorkspaceWrapper>
      <Modal show={showCreateWorkspaceModal} onCloseModal={onCloseModal}>
        <form onSubmit={onCreateWorkspace}>
          <Label id="workspace-label">
            <span>워크스페이스 이름</span>
            <Input id="workspace" value={newWorkspace} onChange={onChangeNewWorkspace}/>
          </Label>
          <Label id="workspace-url-label">
            <span>워크스페이스 url</span>
            <Input id="workspace" value={newUrl} onChange={onChangeNewUrl}/>
          </Label>
          <Button type="submit">생성하기</Button>
        </form>
      </Modal>
      <CreateChannelModal show={showCreateChannelModal} onCloseModal={onCloseModal} setShowCreateChannelModal={setShowCreateChannelModal} />
      <InviteWorkspaceModal show={showInviteWorkspaceModal} onCloseModal={onCloseModal} setShowInviteWorkspaceModal={setShowInviteWorkspaceModal}/>
      <InviteChannelModal show={showInviteChannelModal} onCloseModal={onCloseModal} setShowInviteChannelModal={setShowInviteChannelModal}/>
    </div>
  )
}

export default Workspace;