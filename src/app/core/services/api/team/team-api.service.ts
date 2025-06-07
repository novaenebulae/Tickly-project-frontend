import { APP_CONFIG } from '../../../config/app-config';
import {ApiConfigService} from '../api-config.service';
import {inject, Injectable} from '@angular/core';
import {TeamApiMockService} from './team-api-mock.service';
import {Observable, throwError} from 'rxjs';
import {
  InviteTeamMemberDto,
  InviteTeamMemberResponseDto,
  Role,
  TeamMember, UpdateTeamMemberDto
} from '../../../models/user/team-member.model';
import {catchError, tap} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TeamApiService {
  private apiConfig = inject(ApiConfigService);
  private http = inject(ApiConfigService).http;
  private mockService = inject(TeamApiMockService);

  /**
   * Récupère les membres d'équipe d'une structure.
   */
  getStructureTeamMembers(structureId: number): Observable<TeamMember[]> {
    const endpointContext = APP_CONFIG.api.endpoints.team.structure(structureId);

    if (this.apiConfig.isMockEnabledForDomain('team')) {
      return this.mockService.mockGetStructureTeamMembers(structureId);
    }

    this.apiConfig.logApiRequest('GET', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.get<TeamMember[]>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleTeamError(error, 'getStructureTeamMembers'))
    );
  }

  /**
   * Récupère les rôles disponibles.
   */
  getAvailableRoles(): Observable<Role[]> {
    const endpointContext = APP_CONFIG.api.endpoints.team.roles;

    if (this.apiConfig.isMockEnabledForDomain('team')) {
      return this.mockService.mockGetAvailableRoles();
    }

    this.apiConfig.logApiRequest('GET', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.get<Role[]>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleTeamError(error, 'getAvailableRoles'))
    );
  }

  /**
   * Invite un utilisateur à rejoindre l'équipe.
   */
  inviteTeamMember(inviteDto: InviteTeamMemberDto): Observable<InviteTeamMemberResponseDto> {
    const endpointContext = APP_CONFIG.api.endpoints.team.invite;

    if (this.apiConfig.isMockEnabledForDomain('team')) {
      return this.mockService.mockInviteTeamMember(inviteDto);
    }

    this.apiConfig.logApiRequest('POST', endpointContext, inviteDto);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.post<InviteTeamMemberResponseDto>(url, inviteDto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', endpointContext, response)),
      catchError(error => this.handleTeamError(error, 'inviteTeamMember'))
    );
  }

  /**
   * Met à jour un membre d'équipe.
   */
  updateTeamMember(memberId: number, updateDto: UpdateTeamMemberDto): Observable<TeamMember> {
    const endpointContext = APP_CONFIG.api.endpoints.team.member(memberId);

    if (this.apiConfig.isMockEnabledForDomain('team')) {
      return this.mockService.mockUpdateTeamMember(memberId, updateDto);
    }

    this.apiConfig.logApiRequest('PUT', endpointContext, updateDto);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.put<TeamMember>(url, updateDto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('PUT', endpointContext, response)),
      catchError(error => this.handleTeamError(error, 'updateTeamMember'))
    );
  }

  /**
   * Supprime un membre d'équipe.
   */
  removeTeamMember(memberId: number): Observable<void> {
    const endpointContext = APP_CONFIG.api.endpoints.team.member(memberId);

    if (this.apiConfig.isMockEnabledForDomain('team')) {
      return this.mockService.mockRemoveTeamMember(memberId);
    }

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

    if (this.apiConfig.isMockEnabledForDomain('team')) {
      return this.mockService.mockResendTeamMemberInvitation(memberId);
    }

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
    let userMessage = 'Une erreur est survenue avec la gestion des équipes.';

    if (error.status === 404) {
      userMessage = 'Membre d\'équipe ou structure non trouvé(e).';
    } else if (error.status === 403) {
      userMessage = 'Vous n\'avez pas les permissions pour cette action.';
    } else if (error.status === 400) {
      userMessage = 'Données invalides pour la gestion de l\'équipe.';
    } else if (error.status === 409) {
      userMessage = error.error?.message || 'Conflit lors de l\'opération (ex: utilisateur déjà membre).';
    }

    return throwError(() => ({
      status: error.status,
      message: userMessage,
      originalError: error
    }));
  }
}
