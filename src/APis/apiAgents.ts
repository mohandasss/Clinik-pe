import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type Method,
    type AxiosRequestHeaders,
} from "axios";

type ApiResponse<T> = {
    data: T | null;
    status: number;
    statusText: string;
    headers: Record<string, string>;
};

class ApiAgent {
    private readonly apiAgent: AxiosInstance;
    private readonly baseConfig = {
        baseURL: "https://www.api.clinikpe.com/",
        method: "get",
        withCredentials: true,
        headers: {
            Accept: "application/json",
        },
    };
    private config: AxiosRequestConfig = { ...this.baseConfig }

    constructor(baseURL?: string) {
        this.apiAgent = axios.create();
        this.config.baseURL = baseURL || this.config.baseURL;
        this.apiAgent.interceptors.request.use(
            (config) => {
                //console.log("[Request]", config.method?.toUpperCase(), config.url);
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.apiAgent.interceptors.response.use(
            (response) => {
                //console.log("[Response]", response.status, response.config.url);
                return response;
            },
            (error) => {
                //console.error("[Error]", error);
                if (axios.isAxiosError(error)) {
                    const status = error.response?.status;

                    // Handle Unauthorized globally: clear auth and redirect to login
                    if (status === 401) {
                        try {
                            // Clear known auth keys (app may use these)
                            localStorage.removeItem("extendedvaluekey");
                            localStorage.removeItem("selected-center");
                            localStorage.removeItem("auth-storage");
                            localStorage.removeItem("clinik-sidebar");
                        } catch {
                            // ignore local storage issues
                        }

                        try {
                            sessionStorage.clear();
                        } catch {
                            // ignore
                        }

                        // Avoid redirect loop if already on login
                        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
                            window.location.href = "/login";
                        }
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    path(path: string): ApiAgent {
        this.config.url = path;
        return this;
    }

    method(method: Method): ApiAgent {
        this.config.method = method;
        return this;
    }

    json(data: unknown): ApiAgent {
        this.config.data = data;
        this.config.headers = {
            ...this.config.headers,
            "Content-Type": "application/json",
        };
        return this;
    }


    form(data: FormData): ApiAgent {
        this.config.data = data;
        const headers = { ...(this.config.headers || {}) } as AxiosRequestHeaders;
        if (headers["Content-Type"]) delete headers["Content-Type"];
        this.config.headers = headers;
        return this;
    }

    query(params: Record<string, unknown>): ApiAgent {
        this.config.params = params;
        return this;
    }

    header(key: string, value: string): ApiAgent {
        this.config.headers = {
            ...this.config.headers,
            [key]: value,
        };
        return this;
    }

    cleanHeaders(headers: unknown): Record<string, string> {
        const result: Record<string, string> = {};
        if (!headers || typeof headers !== "object") return result;
        const obj = headers as Record<string, unknown>;
        for (const key in obj) {
            const value = obj[key];
            if (typeof value === "string") {
                result[key] = value;
            } else if (value != null) {
                result[key] = String(value);
            }
        }
        return result;
    }
    resetConfigAfterCall() {
        const baseURL = this.config.baseURL
        //console.log('baseURL=', baseURL)
        this.config = { ...this.baseConfig, baseURL }
    }
    async execute<T = unknown>(): Promise<ApiResponse<T>> {
        try {
            //console.log(this.config)
            const response = await this.apiAgent(this.config);
            this.resetConfigAfterCall()
            return {
                data: response.data,
                status: response.status,
                statusText: response.statusText,
                headers: this.cleanHeaders(response.headers),
            };
        } catch (e: unknown) {
            this.resetConfigAfterCall()
            console.log(e);
            if (axios.isAxiosError(e)) {
                const response = e.response;
                if (!response) {
                    return {
                        data: null,
                        status: 0,
                        statusText: "Something went wrong",
                        headers: {},
                    };
                }
                return {
                    data: response.data,
                    status: response.status,
                    statusText: response.statusText,
                    headers: this.cleanHeaders(response.headers),
                };
            }
            return {
                data: null,
                status: 0,
                statusText: "Something went wrong",
                headers: {},
            };
        }
    }
}

const apiAgent = new ApiAgent();


// const pmsApiAgent = new ApiAgent("https://pms.v-xplore.com");
//const pmsApiAgent = new ApiAgent("http://localhost:3000");
export default apiAgent;
// export { pmsApiAgent };
