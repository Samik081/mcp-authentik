import {
  Configuration,
  AdminApi,
  AuthenticatorsApi,
  CoreApi,
  CryptoApi,
  EnterpriseApi,
  EventsApi,
  FlowsApi,
  ManagedApi,
  Oauth2Api,
  OutpostsApi,
  PoliciesApi,
  PropertymappingsApi,
  ProvidersApi,
  RacApi,
  RbacApi,
  RootApi,
  SchemaApi,
  SourcesApi,
  SsfApi,
  StagesApi,
  TenantsApi,
} from '@goauthentik/api';

export class AuthentikClient {
  private readonly config: Configuration;

  constructor(baseUrl: string, token: string) {
    this.config = new Configuration({
      basePath: baseUrl,
      accessToken: token,
    });
  }

  // Lazy API getters for all 21 API classes

  private _adminApi?: AdminApi;
  get adminApi(): AdminApi {
    return (this._adminApi ??= new AdminApi(this.config));
  }

  private _authenticatorsApi?: AuthenticatorsApi;
  get authenticatorsApi(): AuthenticatorsApi {
    return (this._authenticatorsApi ??= new AuthenticatorsApi(this.config));
  }

  private _coreApi?: CoreApi;
  get coreApi(): CoreApi {
    return (this._coreApi ??= new CoreApi(this.config));
  }

  private _cryptoApi?: CryptoApi;
  get cryptoApi(): CryptoApi {
    return (this._cryptoApi ??= new CryptoApi(this.config));
  }

  private _enterpriseApi?: EnterpriseApi;
  get enterpriseApi(): EnterpriseApi {
    return (this._enterpriseApi ??= new EnterpriseApi(this.config));
  }

  private _eventsApi?: EventsApi;
  get eventsApi(): EventsApi {
    return (this._eventsApi ??= new EventsApi(this.config));
  }

  private _flowsApi?: FlowsApi;
  get flowsApi(): FlowsApi {
    return (this._flowsApi ??= new FlowsApi(this.config));
  }

  private _managedApi?: ManagedApi;
  get managedApi(): ManagedApi {
    return (this._managedApi ??= new ManagedApi(this.config));
  }

  private _oauth2Api?: Oauth2Api;
  get oauth2Api(): Oauth2Api {
    return (this._oauth2Api ??= new Oauth2Api(this.config));
  }

  private _outpostsApi?: OutpostsApi;
  get outpostsApi(): OutpostsApi {
    return (this._outpostsApi ??= new OutpostsApi(this.config));
  }

  private _policiesApi?: PoliciesApi;
  get policiesApi(): PoliciesApi {
    return (this._policiesApi ??= new PoliciesApi(this.config));
  }

  private _propertymappingsApi?: PropertymappingsApi;
  get propertymappingsApi(): PropertymappingsApi {
    return (this._propertymappingsApi ??= new PropertymappingsApi(this.config));
  }

  private _providersApi?: ProvidersApi;
  get providersApi(): ProvidersApi {
    return (this._providersApi ??= new ProvidersApi(this.config));
  }

  private _racApi?: RacApi;
  get racApi(): RacApi {
    return (this._racApi ??= new RacApi(this.config));
  }

  private _rbacApi?: RbacApi;
  get rbacApi(): RbacApi {
    return (this._rbacApi ??= new RbacApi(this.config));
  }

  private _rootApi?: RootApi;
  get rootApi(): RootApi {
    return (this._rootApi ??= new RootApi(this.config));
  }

  private _schemaApi?: SchemaApi;
  get schemaApi(): SchemaApi {
    return (this._schemaApi ??= new SchemaApi(this.config));
  }

  private _sourcesApi?: SourcesApi;
  get sourcesApi(): SourcesApi {
    return (this._sourcesApi ??= new SourcesApi(this.config));
  }

  private _ssfApi?: SsfApi;
  get ssfApi(): SsfApi {
    return (this._ssfApi ??= new SsfApi(this.config));
  }

  private _stagesApi?: StagesApi;
  get stagesApi(): StagesApi {
    return (this._stagesApi ??= new StagesApi(this.config));
  }

  private _tenantsApi?: TenantsApi;
  get tenantsApi(): TenantsApi {
    return (this._tenantsApi ??= new TenantsApi(this.config));
  }

  async validateConnection(): Promise<string> {
    const version = await this.adminApi.adminVersionRetrieve();
    return version.versionCurrent;
  }
}
