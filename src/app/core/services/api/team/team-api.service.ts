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

    return this.http.get<TeamMember[]>(url, { headers }).pipe(
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

    return this.http.post<TeamMember[]>(url, inviteDto, { headers }).pipe(
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

    this.apiConfig.logApiRequest('POST', endpointContext, { token });
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    // Construire l'URL avec le paramètre token
    const urlWithToken = `${url}?token=${encodeURIComponent(token)}`;

    return this.http.post<TeamInvitationAcceptanceResponseDto>(urlWithToken, {}, { headers }).pipe(
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

    return this.http.put<TeamMember>(url, updateDto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('PUT', endpointContext, response)),
      catchError(error => this.handleTeamError(error, 'updateTeamMember'))
    );
  }

  /**
   * Met à jour le rôle d'un membre d'équipe.
   */
  updateTeamMemberRole(memberId: number, role: UserRole): Observable<TeamMember> {
    const endpointContext = APP_CONFIG.api.endpoints.team.memberRole(memberId);

    this.apiConfig.logApiRequest('PUT', endpointContext, { role });
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.put<TeamMember>(url, { role }, { headers }).pipe(
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

    return this.http.delete<void>(url, { headers }).pipe(
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

    return this.http.post<{ success: boolean; message?: string }>(url, {}, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', endpointContext, response)),
      catchError(error => this.handleTeamError(error, 'resendTeamMemberInvitation'))
    );
  }

  /**
   * Gère les erreurs des appels API Team.
   */
  private handleTeamError(error: HttpErrorResponse, context: string): Observable<never> {
    this.apiConfig.logApiError('TEAM-API', context, error);

    let errorMessage = 'Une erreur est survenue lors de l\'opération sur l\'équipe.';

    if (error.status === 400) {
      errorMessage = error.error?.message || 'Données invalides pour cette opération.';
    } else if (error.status === 401) {
      errorMessage = 'Vous n\'êtes pas autorisé à effectuer cette opération.';
    } else if (error.status === 403) {
      errorMessage = 'Vous n\'avez pas les permissions nécessaires pour cette opération.';
    } else if (error.status === 409) {
      errorMessage = error.error?.message || 'Conflit : cette opération ne peut pas être effectuée.';
    } else if (error.status >= 500) {
      errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
    }

    return throwError(() => new Error(errorMessage));
  }
}
