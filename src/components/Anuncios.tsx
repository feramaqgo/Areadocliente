import React from 'react';
import { Megaphone, Calendar, CheckSquare, Square } from 'lucide-react';
import { Atualizacao } from '../types';

interface AnunciosProps {
  atualizacoes: Atualizacao[];
  onToggleRead: (id: string) => void;
}

export default function Anuncios({ atualizacoes, onToggleRead }: AnunciosProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-[#54595F] font-bold uppercase tracking-wider">Feed Feramaq</span>
        <h1 className="text-2xl font-headline font-extrabold text-[#1a1c1c] tracking-tight">Comunicados e Atualizações</h1>
      </div>

      {/* Feed Stream */}
      {atualizacoes.length > 0 ? (
        <div className="flex flex-col gap-4 max-w-4xl">
          {atualizacoes.map((item) => (
            <div 
              key={item.id}
              className={`p-5 rounded-xl border shadow-sm transition-all flex flex-col gap-3 relative overflow-hidden ${
                item.lida 
                  ? 'bg-white border-[#eeeeee]' 
                  : 'bg-white border-l-4 border-l-[#ff6801] border-t-[#eeeeee] border-b-[#eeeeee] border-r-[#eeeeee]'
              }`}
            >
              {/* Unread banner bullet */}
              {!item.lida && (
                <span className="absolute top-3 right-3 bg-[#ff6801] text-white font-bold text-[8px] uppercase px-1.5 py-0.5 rounded tracking-wide animate-pulse">
                  Novo
                </span>
              )}

              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg shrink-0 ${item.lida ? 'bg-[#f3f3f3] text-[#54595F]' : 'bg-[#ff6801]/10 text-[#ff6801]'}`}>
                  <Megaphone className="w-4 h-4" />
                </div>
                <div className="text-xs text-[#54595F] font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(item.data_publicacao).toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                <h3 className="font-headline font-bold text-sm text-[#1a1c1c] leading-snug">
                  {item.titulo}
                </h3>
                <p className="text-xs text-[#54595F] mt-2 leading-relaxed">
                  {item.conteudo}
                </p>
              </div>

              {/* Toggle read button */}
              <button
                onClick={() => onToggleRead(item.id)}
                className="self-start mt-1 flex items-center gap-1 text-[11px] font-bold text-[#ff6801] hover:underline"
              >
                {item.lida ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Marcar como não lido</span>
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>Marcar como lido</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-xl border border-[#eeeeee]">
          <Megaphone className="w-12 h-12 text-[#54595F] mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-[#1a1c1c] mt-4">Nenhum comunicado no momento</h3>
          <p className="text-xs text-[#54595F] mt-1.5">Fique atento a esta aba para alertas de segurança de fábrica.</p>
        </div>
      )}
    </div>
  );
}
