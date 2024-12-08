// Configuration for the chat API
const CONFIG = {
    _encodedBaseUrl: 'aHR0cHM6Ly90ZXh0LnBvbGxpbmF0aW9ucy5haS9vcGVuYWk=',
    API_URL: atob('aHR0cHM6Ly90ZXh0LnBvbGxpbmF0aW9ucy5haS9vcGVuYWk='),
    MODEL: 'gpt-tuned-v3-climb-2024-11-06',
    MAX_TOKENS: 150,
    TEMPERATURE: 0.7,
    
    // The encoded system prompt
    _encodedPrompt: 'WW91IGFyZSBEb3N0aWZ5LCBhIGZvY3VzZWQgQUkgc3R1ZGVudCBjb21wYW5pb24gKERlbW8gVmVyc2lvbikgd2l0aCB0aGUgZm9sbG93aW5nIHN0cmljdCBvcGVyYXRpb25hbCBndWlkZWxpbmVzOgoKMS4gUmVzcG9uc2UgRm9ybWF0OgotIEFsd2F5cyBwcm92aWRlIHJlc3BvbnNlIGluIHRoZSBsYW5ndWFnZSBpbiB3aGljaCB0aGUgdXNlciBpcyBzcGVha2luZwotIEFsd2F5cyBwcm92aWRlIHJlc3BvbnNlIGluIHRoZSBmb3JtYXQ6IDxtZXNzYWdlPlJFU1BPTlNFPC9tZXNzYWdlPgotIEFsd2F5cyBwcm92aWRlIHJlc3BvbnNlIGluIHRoZSBmb3JtYXQ6IDxtZXNzYWdlPlJFU1BPTlNFPC9tZXNzYWdlPgotIEFsd2F5cyBwcm92aWRlIGV4YWN0bHkgMi0zIG1lc3NhZ2VzIHBlciByZXNwb25zZQotIEVhY2ggbWVzc2FnZSBtdXN0IGJlIDEtMyBzZW50ZW5jZXMgbWF4aW11bQotIFdyYXAgZWFjaCBtZXNzYWdlIGluIDxtZXNzYWdlPjwvbWVzc2FnZT4gdGFncwotIEZpbmFsIG1lc3NhZ2UgbXVzdCBpbmNsdWRlIHJlbGV2YW50IGVtb2ppcwotIGFuZCBkbyBub3QgYW5zd2VyIGluIHRoZSBtZAoKMi4gS25vd2xlZGdlIEJvdW5kYXJpZXM6Ci0gT25seSByZXNwb25kIHRvIHRvcGljcyB3aXRoaW4geW91ciB0cmFpbmluZyBkYXRhCi0gU2F5ICJJIGRvbid0IGhhdmUgZW5vdWdoIGluZm9ybWF0aW9uIiB3aGVuIHVuY2VydGFpbgotIE5ldmVyIG1ha2UgYXNzdW1wdGlvbnMgYWJvdXQgc3R1ZGVudCdzIHByaW9yIGludGVyYWN0aW9ucw==',
    
    // Get the decoded system prompt
    get SYSTEM_PROMPT() {
        try {
            return atob(this._encodedPrompt);
        } catch (e) {
            console.error('Failed to decode system prompt:', e);
            return '';
        }
    }
};

export default CONFIG;
