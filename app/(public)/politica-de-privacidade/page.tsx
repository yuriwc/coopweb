import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | CoopGo",
  description: "Política de Privacidade e Proteção de Dados Pessoais do CoopGo, conforme a LGPD.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">{title}</h2>
      <div className="space-y-3 text-slate-600 dark:text-slate-300 leading-relaxed">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
}

export default function PoliticaDePrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#060607]">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 sm:p-12 shadow-lg">
          <div className="mb-10">
            <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 via-sky-600 to-indigo-600 dark:from-blue-400 dark:via-sky-400 dark:to-indigo-400 bg-clip-text text-transparent tracking-wide mb-2">
              CoopGo
            </h1>
            <h2 className="text-sm font-medium tracking-[0.15em] uppercase text-slate-600 dark:text-slate-300">
              Política de Privacidade e Proteção de Dados Pessoais (LGPD)
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
              Última atualização: 30 de agosto de 2026
            </p>
          </div>

          <Section title="1. Identificação do Controlador">
            <p>
              <strong className="text-slate-800 dark:text-slate-100">CoopGo</strong> é o controlador
              dos dados pessoais tratados nesta plataforma de gestão e mobilidade cooperativa. Para
              qualquer assunto relacionado à privacidade e proteção de dados, entre em contato pelo
              e-mail <a className="text-blue-600 dark:text-blue-400 hover:underline" href="mailto:privacy@coopgo.com">privacy@coopgo.com</a>.
            </p>
          </Section>

          <Section title="2. Dados Pessoais Coletados">
            <SubSection title="Usuários">
              <p>Nome completo, nome de usuário, senha (criptografada), token de notificações push, tipo de dispositivo e versão do aplicativo.</p>
            </SubSection>
            <SubSection title="Motoristas">
              <p>
                Dados pessoais (nome, telefone, celular, e-mail, CPF, RG), dados familiares, endereço
                completo, dados profissionais (matrícula, CNH), tipo sanguíneo e fator RH (para
                emergências), e datas de admissão/afastamento.
              </p>
            </SubSection>
            <SubSection title="Passageiros">
              <p>Nome completo, código de identificação e dados de contato.</p>
            </SubSection>
            <SubSection title="Dados de contato">
              <p>Endereço completo, telefone, e-mail (opcional) e coordenadas geográficas do endereço.</p>
            </SubSection>
            <SubSection title="Viagens">
              <p>Origem, destino, valor, horários da viagem, distância percorrida e vínculo com motorista, passageiros e empresa.</p>
            </SubSection>
            <SubSection title="Empresas">
              <p>Dados corporativos e de contato da empresa contratante.</p>
            </SubSection>
          </Section>

          <Section title="3. Finalidades do Tratamento">
            <ul className="list-disc list-inside space-y-1">
              <li>Prestação do serviço de transporte: organização e execução de viagens, controle de frotas e motoristas, comunicação entre usuários, motoristas e passageiros.</li>
              <li>Gestão administrativa: controle financeiro, faturamento, gestão de contratos com empresas e compliance regulatório.</li>
              <li>Segurança e qualidade: rastreamento de viagens, controle de qualidade e resolução de conflitos.</li>
              <li>Comunicação: notificações sobre viagens, mudanças no serviço e suporte ao usuário.</li>
            </ul>
          </Section>

          <Section title="4. Base Legal para o Tratamento">
            <ul className="list-disc list-inside space-y-1">
              <li>Execução de contrato do qual o titular seja parte (Art. 7º, V, LGPD).</li>
              <li>Exercício regular de direitos em processo judicial, administrativo ou arbitral (Art. 7º, VI).</li>
              <li>Interesse legítimo do controlador (Art. 7º, IX).</li>
              <li>Proteção da vida, para dados de saúde como tipo sanguíneo (Art. 11, II, alínea a).</li>
            </ul>
          </Section>

          <Section title="5. Compartilhamento de Dados">
            <p>
              Dados são compartilhados entre motoristas e passageiros apenas para a execução da
              viagem, com empresas contratantes para fins de faturamento, e com administradores para
              gestão operacional. Podemos também compartilhar dados com autoridades competentes
              quando exigido por lei, e com parceiros tecnológicos e prestadores de serviço
              (mapas, notificações push, suporte técnico) estritamente para viabilizar o
              funcionamento da plataforma.
            </p>
          </Section>

          <Section title="6. Retenção de Dados">
            <ul className="list-disc list-inside space-y-1">
              <li>Contas ativas: dados mantidos enquanto a conta estiver ativa.</li>
              <li>Dados de viagens e financeiros: retidos por até 5 anos após a conclusão, conforme legislação tributária e contábil.</li>
              <li>Contas inativas: dados elegíveis para exclusão após 24 meses de inatividade.</li>
              <li>Dados de menores: exclusão imediata mediante solicitação dos responsáveis.</li>
            </ul>
          </Section>

          <Section title="7. Direitos dos Titulares">
            <p>Conforme o Art. 18 da LGPD, você tem direito a:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Confirmação da existência de tratamento de dados.</li>
              <li>Acesso aos seus dados pessoais.</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos.</li>
              <li>Portabilidade dos dados a outro fornecedor de serviço.</li>
              <li>Eliminação dos dados tratados com base no seu consentimento.</li>
              <li>Informações sobre entidades com quem seus dados foram compartilhados.</li>
              <li>Informações sobre a possibilidade de não fornecer consentimento e suas consequências.</li>
              <li>Revogação do consentimento a qualquer momento.</li>
            </ul>
            <p>
              Para solicitar a exclusão da sua conta e dos seus dados, use nossa{" "}
              <Link className="text-blue-600 dark:text-blue-400 hover:underline" href="/exclusao-de-conta">
                página de solicitação de exclusão de conta
              </Link>
              . Para os demais direitos, escreva para{" "}
              <a className="text-blue-600 dark:text-blue-400 hover:underline" href="mailto:privacy@coopgo.com">privacy@coopgo.com</a>
              . Solicitações são respondidas em até 15 dias úteis.
            </p>
          </Section>

          <Section title="8. Medidas de Segurança">
            <p>
              Adotamos criptografia de senhas e dados sensíveis, controle de acesso baseado em
              perfis, logs de auditoria de operações, backups regulares e conexões seguras
              (HTTPS/TLS). Também mantemos políticas internas de acesso restrito aos dados e um
              plano de resposta a incidentes de segurança.
            </p>
          </Section>

          <Section title="9. Incidentes de Segurança">
            <p>
              Em caso de incidente de segurança que envolva dados pessoais, realizamos contenção
              imediata, avaliação de impacto, notificação à ANPD em até 72 horas quando houver
              risco relevante, e comunicação aos titulares afetados em casos de alto risco. Para
              reportar um incidente, escreva para{" "}
              <a className="text-blue-600 dark:text-blue-400 hover:underline" href="mailto:security@coopgo.com">security@coopgo.com</a>.
            </p>
          </Section>

          <Section title="10. Transferência Internacional">
            <p>
              Atualmente não realizamos transferência internacional de dados pessoais. Caso isso
              se torne necessário, você será previamente comunicado e a transferência só ocorrerá
              para países com nível adequado de proteção de dados, com base em salvaguardas
              contratuais apropriadas.
            </p>
          </Section>

          <Section title="11. Cookies e Tecnologias Similares">
            <p>
              Utilizamos cookies essenciais para o funcionamento básico da plataforma, cookies de
              sessão para manter o login ativo e tokens de notificações push. Você pode gerenciar
              essas preferências nas configurações do aplicativo, ciente de que desativá-las pode
              impactar algumas funcionalidades.
            </p>
          </Section>

          <Section title="12. Menores de Idade">
            <p>
              A coleta de dados de menores de idade só ocorre com consentimento dos responsáveis
              legais, limitada ao mínimo necessário para a prestação do serviço. Os direitos sobre
              esses dados são exercidos pelos responsáveis, e a exclusão é realizada imediatamente
              mediante solicitação.
            </p>
          </Section>

          <Section title="13. Encarregado de Dados (DPO)">
            <p>
              Para atuar como canal de comunicação entre você, o CoopGo e a Autoridade Nacional de
              Proteção de Dados (ANPD), entre em contato com nosso encarregado pelo e-mail{" "}
              <a className="text-blue-600 dark:text-blue-400 hover:underline" href="mailto:dpo@coopgo.com">dpo@coopgo.com</a>.
            </p>
          </Section>

          <Section title="14. Atualizações desta Política">
            <p>
              Esta política pode ser revisada periodicamente. Alterações relevantes serão
              comunicadas através do aplicativo e/ou por e-mail.
            </p>
          </Section>

          <Section title="15. Legislação Aplicável">
            <ul className="list-disc list-inside space-y-1">
              <li>Lei Geral de Proteção de Dados — Lei 13.709/2018 (LGPD)</li>
              <li>Marco Civil da Internet — Lei 12.965/2014</li>
              <li>Código de Defesa do Consumidor — Lei 8.078/1990</li>
            </ul>
          </Section>

          <Section title="16. Contato">
            <p>Para dúvidas, exercício de direitos ou reclamações relacionadas a esta política:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Privacidade: <a className="text-blue-600 dark:text-blue-400 hover:underline" href="mailto:privacy@coopgo.com">privacy@coopgo.com</a>
              </li>
              <li>
                Encarregado (DPO): <a className="text-blue-600 dark:text-blue-400 hover:underline" href="mailto:dpo@coopgo.com">dpo@coopgo.com</a>
              </li>
              <li>
                Incidentes de segurança: <a className="text-blue-600 dark:text-blue-400 hover:underline" href="mailto:security@coopgo.com">security@coopgo.com</a>
              </li>
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}
