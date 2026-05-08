export interface HeaderParam {
    /** HTTP header name, e.g. 'X-Compania' */
    name: string;
    /** Throw 400 if the header is absent */
    required?: boolean;
}

export interface DynamicEndpoint {
    name: string;
    sql: string;
    type: 'query' | 'procedure';
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    isCollection?: boolean;
    pagination?: boolean;
    primaryKey?: string;
    description?: string;
    /**
     * Headers whose values are injected as the first bind variables in the SQL,
     * in declaration order.  The SQL must use :p1, :p2 … for these slots;
     * any additional params from the q= filter are numbered afterwards.
     *
     * Example: headerParams: [{ name: 'X-Compania', required: true }]
     * SQL: SELECT … FROM poliza WHERE compania = :p1
     */
    headerParams?: HeaderParam[];
}
