import { NextResponse } from 'next/server';

export type ApiResult<T> = {
    error?: string,
    errorCode?: string,
    data?: T,
}

export namespace apiServer {

    type ApiRequest<Params> = {
        p: Params,
        req: Request,
    }

    type ApiHandler<Params, Return> = (r: ApiRequest<Params>) => Promise<Return | undefined>;

    export function handler<Params, Return>(
        realHandler: ApiHandler<Params, Return>
    ) {
        return async (
            req: Request,
        ) => {
            try {

                let p = await req.json() as Params;

                const result = await realHandler({ p, req });

                return NextResponse.json({ data: result });
            } catch (err: any) {
                return NextResponse.json(
                    { error: err.message ?? err.toString() },
                    { status: 500 }
                );
            }
        };
    }

}
