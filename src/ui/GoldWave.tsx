import React from 'react';
import Svg,{Path,Circle} from 'react-native-svg';
export function GoldWave(){return <Svg width="100%" height="100%" viewBox="0 0 400 260" preserveAspectRatio="none">
{Array.from({length:25},(_,i)=><Path key={i} d={'M-40 '+(60+i*4)+' C80 '+(110+i*5)+' 90 '+(20+i*3)+' 190 '+(90+i*5)+' S310 '+(230-i*3)+' 460 '+(95+i*5)} stroke={i%4===0?'#f5d589':'#b5832c'} strokeWidth={i%4===0?1:.45} opacity={.3+i/65} fill="none"/>)}
{Array.from({length:150},(_,i)=><Circle key={'d'+i} cx={(i*41)%420} cy={100+Math.sin(i*1.7)*54+Math.floor(i/30)*20} r={i%9===0?1.5:.75} fill="#f6ce79" opacity={.2+(i%7)/10}/>)}
</Svg>}
