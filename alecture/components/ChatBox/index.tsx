import { FC, useCallback, useEffect, useRef } from 'react';
import { ChatArea, EachMention, Form, MentionsTextarea, SendButton, Toolbox } from './styles';
import React from 'react';
import autosize from 'autosize';
import { Mention, SuggestionDataItem } from 'react-mentions';
import useSWR from 'swr';
import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import { useParams } from 'react-router-dom';
import gravatar from 'gravatar';

interface Props {
  chat: string;
  onSubmitForm: (e: any) => void;
  onChangeChat: (e: any) => void;
  placeholder?: string;
}


const ChatBox: FC<Props> = ({ chat, onSubmitForm, onChangeChat, placeholder }) => {
  const { workspace, channel } = useParams<{ workspace: string, channel: string }>();
  const { data: userData, error, mutate } = useSWR<IUser | false>('/api/users', fetcher, {
    dedupingInterval: 2000,
  });

  const { data: memberData } = useSWR<IUser[]>(
    userData ? `/api/workspaces/${workspace}/members` : null,
    fetcher,
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
      autosize(textareaRef.current)
    }
  }, [])

  const onKeyDown = useCallback((e: { shiftKey: any; key: string }) => {
    console.log(e);
    if (e.key === 'Enter') {
      if (!e.shiftKey) {
        onSubmitForm(e);
      }
    }
  }, [onSubmitForm]);

  const renderSuggestion = useCallback((
        suggestion: SuggestionDataItem,
        search: string,
        highlightedDisplay: React.ReactNode,
        index: number,
        focus: boolean,
  ): React.ReactNode => {
    if (!memberData) return;
    return (
      <EachMention focus={focus}>
        <img src={gravatar.url(memberData[index].email, { s: '20px', d: 'retro' })} alt={memberData[index].nickname}/>
        <span>{highlightedDisplay}</span>
      </EachMention>
    )
  }, [memberData])

  return (
    <ChatArea>
      <Form onSubmit={onSubmitForm}>
        <MentionsTextarea 
        id="editor-chat"
        value={chat}
        onChange={onChangeChat}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        inputRef={textareaRef}
        allowSuggestionsAboveCursor
        >
          <Mention 
          appendSpaceOnAdd 
          trigger={'@'} 
          data={memberData?.map((v) => ({ id: v.id.toString(), display: v.nickname })) || []}
          renderSuggestion={renderSuggestion}
          />
        </MentionsTextarea>
        <Toolbox>
          <SendButton disabled={!chat?.trim()} disabledChat={!chat?.trim()}>
            <i className="c-icon c-icon--paperplane-filled" aria-hidden="true" />
          </SendButton>
        </Toolbox>
      </Form>
    </ChatArea>
  );
};

export default ChatBox;
