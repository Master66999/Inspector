/**
 * PackCheck Frontend API Client Helper
 * Provides seamless integration between the frontend scanning UI and
 * the FastAPI Python backend service.
 *
 * Configurable BASE_URL defaults to http://localhost:8000
 */

(function (global) {
  const DEFAULT_BASE_URL =
    (typeof window !== "undefined" && (window.PACKCHECK_API_URL || window.API_BASE_URL || localStorage.getItem("PACKCHECK_API_URL"))) ||
    (typeof window !== "undefined" && window.location && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? "http://localhost:8000"
      : "");

  class PackCheckClient {
    constructor(baseURL = DEFAULT_BASE_URL) {
      this.baseURL = baseURL.replace(/\/+$/, "");
    }

    /**
     * Configure base API URL at runtime
     * @param {string} url
     */
    setBaseURL(url) {
      this.baseURL = url.replace(/\/+$/, "");
    }

    /**
     * Helper for standardized HTTP requests
     * @private
     */
    async _request(endpoint, options = {}) {
      const url = `${this.baseURL}${endpoint}`;
      const defaultHeaders = {};

      if (!(options.body instanceof FormData)) {
        defaultHeaders["Content-Type"] = "application/json";
      }

      const config = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...(options.headers || {}),
        },
      };

      try {
        const response = await fetch(url, config);
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          const errorMessage =
            (data && data.detail) ||
            `HTTP ${response.status}: ${response.statusText}`;
          const error = new Error(errorMessage);
          error.status = response.status;
          error.data = data;
          throw error;
        }

        return data;
      } catch (err) {
        if (!err.status) {
          // Network or offline error
          console.error(`[PackCheck API] Network connection failed for ${url}:`, err);
        }
        throw err;
      }
    }

    /**
     * System health check
     * @returns {Promise<Object>}
     */
    async checkHealth() {
      return this._request("/api/health");
    }

    /**
     * Records a barcode scan event and returns product data
     * @param {string} barcode Numeric barcode string (7 to 14 digits)
     * @param {Object} [options]
     * @param {string} [options.userId] Optional user identifier
     * @param {string} [options.deviceInfo] Scanner device metadata
     * @returns {Promise<Object>}
     */
    async scanBarcode(barcode, options = {}) {
      if (!barcode || typeof barcode !== "string") {
        throw new Error("Invalid barcode provided. Barcode must be a non-empty string.");
      }

      return this._request("/api/scan", {
        method: "POST",
        body: JSON.stringify({
          barcode: barcode.trim(),
          user_id: options.userId || null,
          device_info: options.deviceInfo || navigator.userAgent || "browser",
        }),
      });
    }

    /**
     * Retrieves normalized product details by barcode or UUID
     * @param {string} identifier Barcode or database product ID
     * @returns {Promise<Object>} Normalized product response
     */
    async getProduct(identifier) {
      if (!identifier) {
        throw new Error("Identifier is required.");
      }
      return this._request(`/api/products/${encodeURIComponent(identifier.trim())}`);
    }

    /**
     * Generates comprehensive rule-based nutrition and ingredient health profile
     * @param {string} identifier Barcode or database product ID
     * @returns {Promise<Object>} Detailed health profile and ingredient taxonomy
     */
    async analyzeProduct(identifier) {
      if (!identifier) {
        throw new Error("Identifier is required.");
      }
      return this._request(`/api/analyze/${encodeURIComponent(identifier.trim())}`, {
        method: "POST",
      });
    }

    /**
     * Retrieves healthier/similar product alternatives within the same food category
     * @param {string} identifier Barcode or database product ID
     * @param {number} [limit=5] Maximum number of alternatives to return
     * @returns {Promise<Object>} Alternative recommendations with explainable comparisons
     */
    async getAlternatives(identifier, limit = 5) {
      if (!identifier) {
        throw new Error("Identifier is required.");
      }
      return this._request(`/api/alternatives/${encodeURIComponent(identifier.trim())}?limit=${limit}`);
    }

    /**
     * Fallback packaging label scanner using OCR
     * Extracts nutrition facts and ingredients from packaging images
     * @param {File|Blob|FormData} image Image file or existing FormData
     * @param {string} [rawText] Optional manual text override
     * @returns {Promise<Object>} Extracted and analyzed product structure
     */
    async analyzeLabel(image, rawText = null) {
      let formData;
      if (image instanceof FormData) {
        formData = image;
      } else {
        formData = new FormData();
        if (image) {
          formData.append("image", image);
        }
        if (rawText) {
          formData.append("text", rawText);
        }
      }

      return this._request("/api/ocr/analyze", {
        method: "POST",
        body: formData,
      });
    }
  }

  // Create singleton instance
  const apiInstance = new PackCheckClient();

  // Export for Browser window, CommonJS, and ES Modules
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      PackCheckClient,
      api: apiInstance,
      scanBarcode: (b, o) => apiInstance.scanBarcode(b, o),
      getProduct: (id) => apiInstance.getProduct(id),
      analyzeProduct: (id) => apiInstance.analyzeProduct(id),
      getAlternatives: (id, l) => apiInstance.getAlternatives(id, l),
      analyzeLabel: (img, txt) => apiInstance.analyzeLabel(img, txt),
    };
  }

  if (typeof window !== "undefined") {
    if (!window.PACKCHECK_API_URL && !window.API_BASE_URL) {
      fetch("/api/config")
        .then((r) => r.json())
        .then((cfg) => {
          if (cfg && cfg.pythonApiUrl) {
            apiInstance.setBaseURL(cfg.pythonApiUrl);
          }
        })
        .catch(() => {});
    }

    window.PackCheckClient = PackCheckClient;
    window.PackCheckAPI = apiInstance;
    window.scanBarcode = (b, o) => apiInstance.scanBarcode(b, o);
    window.getProduct = (id) => apiInstance.getProduct(id);
    window.analyzeProduct = (id) => apiInstance.analyzeProduct(id);
    window.getAlternatives = (id, l) => apiInstance.getAlternatives(id, l);
    window.analyzeLabel = (img, txt) => apiInstance.analyzeLabel(img, txt);
  }
})(typeof window !== "undefined" ? window : globalThis);
