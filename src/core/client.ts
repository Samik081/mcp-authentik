import {
  AdminApi,
  AuthenticatorsApi,
  Configuration,
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
} from "@goauthentik/api";

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
    this._adminApi ??= new AdminApi(this.config);
    return this._adminApi;
  }

  private _authenticatorsApi?: AuthenticatorsApi;
  get authenticatorsApi(): AuthenticatorsApi {
    this._authenticatorsApi ??= new AuthenticatorsApi(this.config);
    return this._authenticatorsApi;
  }

  private _coreApi?: CoreApi;
  get coreApi(): CoreApi {
    this._coreApi ??= new CoreApi(this.config);
    return this._coreApi;
  }

  private _cryptoApi?: CryptoApi;
  get cryptoApi(): CryptoApi {
    this._cryptoApi ??= new CryptoApi(this.config);
    return this._cryptoApi;
  }

  private _enterpriseApi?: EnterpriseApi;
  get enterpriseApi(): EnterpriseApi {
    this._enterpriseApi ??= new EnterpriseApi(this.config);
    return this._enterpriseApi;
  }

  private _eventsApi?: EventsApi;
  get eventsApi(): EventsApi {
    this._eventsApi ??= new EventsApi(this.config);
    return this._eventsApi;
  }

  private _flowsApi?: FlowsApi;
  get flowsApi(): FlowsApi {
    this._flowsApi ??= new FlowsApi(this.config);
    return this._flowsApi;
  }

  private _managedApi?: ManagedApi;
  get managedApi(): ManagedApi {
    this._managedApi ??= new ManagedApi(this.config);
    return this._managedApi;
  }

  private _oauth2Api?: Oauth2Api;
  get oauth2Api(): Oauth2Api {
    this._oauth2Api ??= new Oauth2Api(this.config);
    return this._oauth2Api;
  }

  private _outpostsApi?: OutpostsApi;
  get outpostsApi(): OutpostsApi {
    this._outpostsApi ??= new OutpostsApi(this.config);
    return this._outpostsApi;
  }

  private _policiesApi?: PoliciesApi;
  get policiesApi(): PoliciesApi {
    this._policiesApi ??= new PoliciesApi(this.config);
    return this._policiesApi;
  }

  private _propertymappingsApi?: PropertymappingsApi;
  get propertymappingsApi(): PropertymappingsApi {
    this._propertymappingsApi ??= new PropertymappingsApi(this.config);
    return this._propertymappingsApi;
  }

  private _providersApi?: ProvidersApi;
  get providersApi(): ProvidersApi {
    this._providersApi ??= new ProvidersApi(this.config);
    return this._providersApi;
  }

  private _racApi?: RacApi;
  get racApi(): RacApi {
    this._racApi ??= new RacApi(this.config);
    return this._racApi;
  }

  private _rbacApi?: RbacApi;
  get rbacApi(): RbacApi {
    this._rbacApi ??= new RbacApi(this.config);
    return this._rbacApi;
  }

  private _rootApi?: RootApi;
  get rootApi(): RootApi {
    this._rootApi ??= new RootApi(this.config);
    return this._rootApi;
  }

  private _schemaApi?: SchemaApi;
  get schemaApi(): SchemaApi {
    this._schemaApi ??= new SchemaApi(this.config);
    return this._schemaApi;
  }

  private _sourcesApi?: SourcesApi;
  get sourcesApi(): SourcesApi {
    this._sourcesApi ??= new SourcesApi(this.config);
    return this._sourcesApi;
  }

  private _ssfApi?: SsfApi;
  get ssfApi(): SsfApi {
    this._ssfApi ??= new SsfApi(this.config);
    return this._ssfApi;
  }

  private _stagesApi?: StagesApi;
  get stagesApi(): StagesApi {
    this._stagesApi ??= new StagesApi(this.config);
    return this._stagesApi;
  }

  private _tenantsApi?: TenantsApi;
  get tenantsApi(): TenantsApi {
    this._tenantsApi ??= new TenantsApi(this.config);
    return this._tenantsApi;
  }

  async validateConnection(): Promise<string> {
    const version = await this.adminApi.adminVersionRetrieve();
    return version.versionCurrent;
  }
}
