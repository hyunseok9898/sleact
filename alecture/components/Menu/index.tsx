// import React, { CSSProperties, FC, PropsWithChildren, useCallback } from 'react';
// import { CloseModalButton, CreateMenu } from './styles';

// interface Props {
//   style: CSSProperties,
//   show: boolean,
//   onCloseModal: (e: any) => void,
//   closeButton: true;
// }


// const Menu: FC<PropsWithChildren<Props>> = ({ children, style, show, onCloseModal, closeButton }) => {
//   const stopPropagation = useCallback((e: { stopPropagation: () => void; }) => {
//     e.stopPropagation();
//   },[]);

//   if (!show) return null;
  
//   return (
//     <CreateMenu onClick={onCloseModal} >
//       <div style={style} onClick={stopPropagation}>
//         {closeButton && <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>}
//         {children}
//       </div>
//     </CreateMenu>
//   )
// }

// export default Menu;

import React, { CSSProperties, FC, PropsWithChildren, useCallback } from "react"
import { CloseModalButton, CreateMenu } from "./styles"

interface Props {
  show: boolean,
  onCloseModal: (e: any) => void,
  style: CSSProperties,
  closeButton? : boolean,
}

const Menu: FC<PropsWithChildren<Props>> = ({children, style, show, onCloseModal, closeButton = true}) => {
  const stopPropagation = useCallback((e: { stopPropagation: () => void; }) => {
    e.stopPropagation();
  },[])

  if (!show) return null;

  return (
    <CreateMenu onClick={onCloseModal}>
      <div style={style} onClick={stopPropagation}> 
        {closeButton && <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>}
        {children}
      </div>
     
    </CreateMenu>
  )
}


export default Menu;