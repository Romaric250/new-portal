import type { PaginationParams, PaginatedResponse } from '@/types';

export const getPaginationParams = (
  searchParams: URLSearchParams,
): PaginationParams => {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('limit') || '10', 10)),
  );
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

  return { page, limit, sortBy, sortOrder };
};

export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  params: PaginationParams,
): PaginatedResponse<T> => {
  const { page = 1, limit = 10 } = params;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

export const getSkipTake = (page: number, limit: number) => {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
};

