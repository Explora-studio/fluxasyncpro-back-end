import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  id_utilisateur: number;
  adresse_email: string;
  nom_complet: string;
  plan_abonnement: string;
  compte_verifie: boolean;
  otp_verified: boolean;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);