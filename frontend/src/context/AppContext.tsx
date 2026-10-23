import {createContext,useContext,useState,ReactNode} from 'react';
import type {SoilInput} from '../services/api';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

type SavedAnalysis={id:string;createdAt:string;soil:SoilInput;result:any;name:string};
type Ctx={soil:SoilInput|null;setSoil:(v:SoilInput)=>void;result:any;setResult:(v:any)=>void;saved:SavedAnalysis[];historyLoading:boolean;refreshHistory:()=>Promise<void>;saveAnalysis:(name?:string)=>Promise<void>;deleteAnalysis:(id:string)=>Promise<void>;clearCurrent:()=>void};
const C=createContext<Ctx|null>(null);

export function AppProvider({children}:{children:ReactNode}){
  const {user}=useAuth();
  const [soil,setSoilState]=useState<SoilInput|null>(()=>{try{return JSON.parse(localStorage.getItem('soilsense-soil')||'null')}catch{return null}});
  const [result,setResultState]=useState<any>(()=>{try{return JSON.parse(localStorage.getItem('soilsense-result')||'null')}catch{return null}});
  const [saved,setSaved]=useState<SavedAnalysis[]>([]);
  const [historyLoading,setHistoryLoading]=useState(false);

  const setSoil=(v:SoilInput)=>{setSoilState(v);localStorage.setItem('soilsense-soil',JSON.stringify(v));};
  const setResult=(v:any)=>{setResultState(v);localStorage.setItem('soilsense-result',JSON.stringify(v));};

  const refreshHistory=async()=>{
    if(!user){setSaved([]);return;}
    setHistoryLoading(true);
    const {data,error}=await supabase.from('soil_analyses').select('*').order('created_at',{ascending:false});
    if(!error && data){
      setSaved(data.map((row:any)=>({id:row.id,createdAt:row.created_at,soil:row.soil_input,result:{predicted_fertility:row.fertility_prediction,fertility_probabilities:row.fertility_probabilities,crop_recommendations:row.crop_recommendations,fertilizer_guidance:row.fertilizer_guidance,shap_explanation:row.shap_explanation},name:row.name||'Soil sample'})));
    }
    setHistoryLoading(false);
  };

  const saveAnalysis=async(name='Soil sample')=>{
    if(!user||!soil||!result)return;
    await supabase.from('soil_analyses').insert({
      user_id:user.id,
      soil_input:soil,
      fertility_prediction:result.predicted_fertility,
      fertility_probabilities:result.fertility_probabilities||{},
      crop_recommendations:result.crop_recommendations||[],
      fertilizer_guidance:result.fertilizer_guidance||[],
      shap_explanation:result.shap_explanation||result.explanation||[],
      name,
    });
    await refreshHistory();
  };

  const deleteAnalysis=async(id:string)=>{
    if(!user)return;
    await supabase.from('soil_analyses').delete().eq('id',id);
    await refreshHistory();
  };

  const clearCurrent=()=>{setSoilState(null);setResultState(null);localStorage.removeItem('soilsense-soil');localStorage.removeItem('soilsense-result');};

  return <C.Provider value={{soil,setSoil,result,setResult,saved,historyLoading,refreshHistory,saveAnalysis,deleteAnalysis,clearCurrent}}>{children}</C.Provider>;
}
export const useApp=()=>{const c=useContext(C);if(!c)throw new Error('useApp must be used inside AppProvider');return c};
