import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    // ainda não existe provedor de e-mail configurado.
    // em desenvolvimento o link aparece no console do servidor.
    // para enviar de verdade, troque o corpo deste método pelo envio via smtp ou api do provedor escolhido.
    async enviarRecuperacaoSenha(destino: string, link: string) {
        if (process.env.NODE_ENV === 'production') {
            this.logger.warn(`provedor de e-mail não configurado: nada enviado para ${destino}`);
            return;
        }

        this.logger.log(`link de recuperação de senha para ${destino}: ${link}`);
    }
}
