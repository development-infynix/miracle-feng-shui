import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

export const apiResponse = {
  ok<T>(data: T, status = 200) {
    return NextResponse.json<ApiResponse<T>>(
      {
        success: true,
        data,
      },
      { status }
    );
  },

  created<T>(data: T) {
    return NextResponse.json<ApiResponse<T>>(
      {
        success: true,
        data,
      },
      { status: 201 }
    );
  },

  error(message: string, status = 500, details?: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: message,
        details,
      },
      { status }
    );
  },

  success<T>(data: T, _message?: string, status = 200) {
    return NextResponse.json<ApiResponse<T>>(
      {
        success: true,
        data,
      },
      { status }
    );
  },

  notFound(message = 'Not Found') {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: message,
      },
      { status: 404 }
    );
  },

  badRequest(message = 'Bad Request', details?: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: message,
        details,
      },
      { status: 400 }
    );
  },

  unauthorized(message = 'Unauthorized') {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: message,
      },
      { status: 401 }
    );
  },

  serverError(message = 'Internal Server Error', details?: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: message,
        details,
      },
      { status: 500 }
    );
  },
};
