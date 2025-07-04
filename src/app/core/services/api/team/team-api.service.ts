import { APP_CONFIG } from '../../../config/app-config';
import {ApiConfigService} from '../api-config.service';
import {inject, Injectable} from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {
  InviteTeamMemberDto,
  InviteTeamMemberResponseDto,
  TeamMember, UpdateTeamMemberDto
} from '../../../models/user/team-member.model';
import {catchError, tap} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {UserRole} from '../../../models/user/user-role.enum';
import {TeamInvitationAcceptanceResponseDto} from '../../../models/user/team-invitation-acceptance-response.dto';


@Injectable({
  providedIn: 'root'
})
export class TeamApiService {
  private apiConfig = inject(ApiConfigService);
  private http = inject(ApiConfigService).http;

  /**
   * Récupère les membres d'équipe d'une structure.
   */
  getStructureTeamMembers(structureId: number): Observable<TeamMember[]> {
    const endpointContext = APP_CONFIG.api.endpoints.team.structure(structureId);

    this.apiConfig.logApiRequest('GET', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.get<TeamMember[]>(url, {headers}).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleTeamError(error, 'getStructureTeamMembers'))
    );
  }

  /**
   * Invite un utilisateur à rejoindre l'équipe.
   */
  inviteTeamMember(structureId: number, inviteDto: InviteTeamMemberDto): Observable<TeamMember[]> {
    const endpointContext = APP_CONFIG.api.endpoints.team.invite(structureId);

    this.apiConfig.logApiRequest('POST', endpointContext, inviteDto);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.post<TeamMember[]>(url, inviteDto, {headers}).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', endpointContext, response)),
      catchError(error => this.handleTeamError(error, 'inviteTeamMember'))
    );
  }

  /**
   * Accepte une invitation à rejoindre une équipe.
   * Retourne maintenant les informations complètes incluant le nouveau token.
   */
  acceptInvitation(token: string): Observable<TeamInvitationAcceptanceResponseDto> {
    const endpointContext = APP_CONFIG.api.endpoints.team.invitationAccept;

    this.apiConfig.logApiRequest('POST', endpointContext, {token});
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    // Construire l'URL avec le paramètre token
    const urlWithToken = `${url}?token=${encodeURIComponent(token)}`;

    return this.http.post<TeamInvitationAcceptanceResponseDto>(urlWithToken, {}, {headers}).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', endpointContext, response)),
      catchError(error => this.handleTeamError(error, 'acceptInvitation'))
    );
  }

  /**
   * Met à jour un membre d'équipe.
   */
  updateTeamMember(memberId: number, updateDto: UpdateTeamMemberDto): Observable<TeamMember> {
    // Si c'est uniquement une mise à jour de rôle, utiliser l'endpoint spécifique
    if (Object.keys(updateDto).length === 1 && 'roleId' in updateDto) {
      return this.updateTeamMemberRole(memberId, updateDto.role!);
    }

    const endpointContext = APP_CONFIG.api.endpoints.team.member(memberId);

    this.apiConfig.logApiRequest('PUT', endpointContext, updateDto);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.put<TeamMember>(url, updateDto, {headers}).pipe(
      tap(response => this.apiConfig.logApiResponse('PUT', endpointContext, response)),
      catchError(error => this.handleTeamError(error, 'updateTeamMember'))
    );
  }

  /**
   * Met à jour le rôle d'un membre d'équipe.
   */
  updateTeamMemberRole(memberId: number, role: UserRole): Observable<TeamMember> {
    const endpointContext = APP_CONFIG.api.endpoints.team.memberRole(memberId);

    this.apiConfig.logApiRequest('PUT', endpointContext, {role});
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.put<TeamMember>(url, {role}, {headers}).pipe(
      tap(response => this.apiConfig.logApiResponse('PUT', endpointContext, response)),
      catchError(error => this.handleTeamError(error, 'updateTeamMemberRole'))
    );
  }

  /**
   * Supprime un membre d'équipe.
   */
  removeTeamMember(memberId: number): Observable<void> {
    const endpointContext = APP_CONFIG.api.endpoints.team.member(memberId);

    this.apiConfig.logApiRequest('DELETE', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.delete<void>(url, {headers}).pipe(
      tap(() => this.apiConfig.logApiResponse('DELETE', endpointContext, 'Suppression réussie')),
      catchError(error => this.handleTeamError(error, 'removeTeamMember'))
    );
  }

  /**
   * Renvoie une invitation à un membre en attente.
   */
  resendTeamMemberInvitation(memberId: number): Observable<{ success: boolean; message?: string }> {
    const endpointContext = APP_CONFIG.api.endpoints.team.member(memberId) + '/resend-invitation';

    this.apiConfig.logApiRequest('POST', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.post<{ success: boolean; message?: string }>(url, {}, {headers}).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', endpointContext, response)),
      catchError(error => this.handleTeamError(error, 'resendTeamMemberInvitation'))
    );
  }

  /**
   * Gère les erreurs des appels API Team.
   * @param error - La HttpErrorResponse reçue du client HTTP.
   * @param context - Une chaîne décrivant l'opération durant laquelle l'erreur s'est produite.
   * @returns Un Observable qui émet un objet d'erreur personnalisé.
   */
  private handleTeamError(error: HttpErrorResponse, context: string): Observable<never> {
    this.apiConfig.logApiError('TEAM-API', context, error);

    let userMessage = 'Une erreur est survenue lors de l\'opération sur l\'équipe.'; // Message par défaut

    const backendMessage = error.error?.message ||
      error.error?.error ||
      error.message;

    if (backendMessage && typeof backendMessage === 'string' && backendMessage.trim()) {
      userMessage = backendMessage;
    } else {
      switch (error.status) {
        case 400:
          userMessage = 'Données invalides pour cette opération.';
          break;
        case 401:
          userMessage = 'Vous n\'êtes pas autorisé à effectuer cette opération.';
          break;
        case 403:
          userMessage = 'Vous n\'avez pas les permissions nécessaires pour cette opération.';
          break;
        case 404:
          userMessage = 'Membre ou équipe non trouvé(e).';
          break;
        case 409:
          userMessage = 'Conflit : cette opération ne peut pas être effectuée.';
          break;
        case 422:
          userMessage = 'Les données fournies ne sont pas valides.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          userMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          break;
        default:
          userMessage = `Erreur ${error.status}: ${error.statusText || 'Erreur inconnue'}`;
      }
    }

    return throwError(() => ({
      status: error.status,
      message: userMessage,
      originalError: error
    }));
  }

}
