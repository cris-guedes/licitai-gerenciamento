export type ExtractEditalDataMetrics = {
    sessionId:          string;
    timestamp:          string;
    pdfUrl:             string;
    pdfFileSizeBytes:   number;
    conversionTimeMs:   number;
    totalTimeMs:        number;
    mdFileSizeBytes:    number;
    mdWordCount:        number;
    doclingFilename:    string;
    tempDir:            string;
};

export type ExtractEditalDataResponse = {
    sessionId:  string;
    mdContent:  string;
    metrics:    ExtractEditalDataMetrics;
};
