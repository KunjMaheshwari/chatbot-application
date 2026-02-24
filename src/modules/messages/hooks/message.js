import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createMessage, getMessage } from "../actions";
import { queryKeys } from "inngest";

export const prefetchMessage = async (queryClient, projectId) => {
  await queryClient.prefetchQuery({
    queryKey: ["messages", projectId],
    queryFn: () => getMessage(projectId),
    staleTime: 10000,
  });
};

export const useGetMessages = (projectId) => {
    return useQuery({
        queryKey: ["messages", projectId],
        queryFn: () => getMessage(projectId),
        staleTime: 10000,
        refetchInterval: (data) => {
            return data?.length ? 5000 : false;
        }
    })
}


export const useCreateMessages = (projectId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (value) => createMessage(value, projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["messages", projectId]
            })
            queryClient.invalidateQueries({
                queryKey: ["status"]
            })
        }
    })
}