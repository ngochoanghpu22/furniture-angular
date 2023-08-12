import { HttpClient } from "@angular/common/http";

export class BaseApiService {
  public accessPointUrl: string = '';

  constructor(protected http: HttpClient) {
    this.accessPointUrl = this.getAccessPointUrl();
  }

  getAccessPointUrl(): string {
    return location.origin.indexOf("localhost") != -1 ? "https://localhost:44370" : location.origin;
  }

  getSlackUrl(redirect:string, state:string): string {
    var target = "https://slack.com/oauth/v2/authorize?client_id=1738753536545.2553409114131&scope=chat:write,im:write,team:read,users:read,users:read.email&user_scope=chat:write,users.profile:write,team:read,users:read&redirect_uri=[redirect]&state=[state]";
    var target = target.replace("[redirect]", encodeURIComponent(redirect));
    var target = target.replace("[state]", encodeURIComponent(state));
    return target;
  }

}
