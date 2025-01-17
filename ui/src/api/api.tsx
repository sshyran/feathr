import Axios from "axios";
import { DataSource, EnvConfig, Feature, FeatureLineage, Role, UserRole } from "../models/model";
import { InteractionRequiredAuthError, PublicClientApplication } from "@azure/msal-browser";
import mockUserRole from "./mock/userrole.json";
import { getMsalConfig } from "../utils/utils";

const msalInstance = getMsalConfig();
const getApiBaseUrl = () => {
  let endpoint = process.env.REACT_APP_API_ENDPOINT
  if (!endpoint || endpoint === '') {
    endpoint = window.location.protocol + "//" + window.location.host;
  }
  return endpoint + "/api/v1";
}

export const fetchDataSources = async (project: string) => {
  const token = await getIdToken(msalInstance);
  return Axios
    .get<DataSource[]>(`${ getApiBaseUrl() }/projects/${ project }/datasources?code=${ token }`,
      { headers: {} })
    .then((response) => {
      return response.data;
    })
};

export const fetchProjects = async () => {
  const token = await getIdToken(msalInstance);
  return Axios
    .get<[]>(`${ getApiBaseUrl() }/projects?code=${ token }`,
      {
        headers: {}
      })
    .then((response) => {
      return response.data;
    })
};

export const fetchFeatures = async (project: string, page: number, limit: number, keyword: string) => {
  const token = await getIdToken(msalInstance);
  return Axios
    .get<Feature[]>(`${ getApiBaseUrl() }/projects/${ project }/features?code=${ token }`,
      {
        params: { 'keyword': keyword, 'page': page, 'limit': limit },
        headers: {}
      })
    .then((response) => {
      return response.data;
    })
};

export const fetchFeature = async (project: string, featureId: string) => {
  const token = await getIdToken(msalInstance);
  return Axios
    .get<Feature>(`${ getApiBaseUrl() }/features/${ featureId }?code=${ token }`, {})
    .then((response) => {
      return response.data;
    })
};

export const fetchProjectLineages = async (project: string) => {
  const token = await getIdToken(msalInstance);
  return Axios
    .get<FeatureLineage>(`${ getApiBaseUrl() }/projects/${ project }?code=${ token }`, {})
    .then((response) => {
      return response.data;
    })
};

export const fetchFeatureLineages = async (project: string) => {
  const token = await getIdToken(msalInstance);
  return Axios
    .get<FeatureLineage>(`${ getApiBaseUrl() }/features/lineage/${ project }?code=${ token }`, {})
    .then((response) => {
      return response.data;
    })
};

// Following are place-holder code
export const createFeature = async (feature: Feature) => {
  const token = await getIdToken(msalInstance);
  return Axios
    .post(`${ getApiBaseUrl() }/features?code=${ token }`, feature,
      {
        headers: { "Content-Type": "application/json;" },
        params: {},
      }).then((response) => {
      return response;
    }).catch((error) => {
      return error.response;
    });
}

export const updateFeature = async (feature: Feature, id: string) => {
  const token = await getIdToken(msalInstance);
  feature.guid = id;
  return await Axios.put(`${ getApiBaseUrl() }/features/${ id }?code=${ token }`, feature,
    {
      headers: { "Content-Type": "application/json;" },
      params: {},
    }).then((response) => {
    return response
  }).catch((error) => {
    return error.response
  });
};

export const listUserRole = async () => {
  let data: UserRole[] = mockUserRole
  return data
};

export const getUserRole = async (userName: string) => {
  const token = await getIdToken(msalInstance);
  return await Axios
    .get<UserRole>(`${ getApiBaseUrl() }/user/${ userName }/userroles?code=${ token }`, {})
    .then((response) => {
      return response.data;
    })
}

export const addUserRole = async (role: Role) => {
  const token = await getIdToken(msalInstance);
  return await Axios
    .post(`${ getApiBaseUrl() }/user/${ role.userName }/userroles/new?code=${ token }`, role,
      {
        headers: { "Content-Type": "application/json;" },
        params: {},
      }).then((response) => {
      return response;
    }).catch((error) => {
      return error.response;
    });
}

export const deleteUserRole = async (role: Role) => {
  const token = await getIdToken(msalInstance);
  return await Axios
    .post(`${ getApiBaseUrl() }/user/${ role.userName }/userroles/delete?code=${ token }`, role,
      {
        headers: { "Content-Type": "application/json;" },
        params: {},
      }).then((response) => {
      return response;
    }).catch((error) => {
      return error.response;
    });
}

export const getIdToken = async (msalInstance: PublicClientApplication): Promise<string> => {
  const activeAccount = msalInstance.getActiveAccount(); // This will only return a non-null value if you have logic somewhere else that calls the setActiveAccount API
  const accounts = msalInstance.getAllAccounts();
  const request = {
    scopes: ["User.Read"],
    account: activeAccount || accounts[0]
  };
  // Silently acquire an token for a given set of scopes. Will use cached token if available, otherwise will attempt to acquire a new token from the network via refresh token.
  await msalInstance.acquireTokenSilent(request).then(response => {
    return response.idToken
  }).catch(error => {
    if (error instanceof InteractionRequiredAuthError) {
      msalInstance.acquireTokenPopup(request).then(response => {
        return response.idToken
      });
    }
  })
  return ""
}
