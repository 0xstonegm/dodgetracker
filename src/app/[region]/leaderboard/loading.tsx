import LoadingSpinner from "@/src/components/LoadingSpinner";

function loading() {
  return (
    <div role="status" className="flex h-[85vh] items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

export default loading;
