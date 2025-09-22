import styled from '@emotion/styled';

export const DMWrapper = styled.div`
  .c-icon--presence-online {
    color: #007a5a; /* 온라인: 초록 */
  }

  .c-icon--presence-offline {
    color: #aaa; /* 오프라인: 회색 */
  }
`;

export const CollapseButton = styled.button<{ collapse: boolean }>`
  background: transparent;
  border: none;
  width: 26px;
  height: 26px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  color: white;
  margin-left: 10px;
  cursor: pointer;
  ${({ collapse }) =>
    collapse &&
    `
    & i {
      transform: none;
    }
  `};
`;



