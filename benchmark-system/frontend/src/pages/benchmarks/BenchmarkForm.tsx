import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Save, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { benchmarkApi } from '../../services/api';
import { ImageUpload } from '../../components/common/ImageUpload';

const benchmarkSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  modelNumber: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  year: z.number().optional(),
  origin: z.string().optional(),
  
  // Cost
  estimatedCost: z.number().optional(),
  currency: z.string().default('USD'),
  
  // Performance
  weight: z.number().optional(),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
  performanceScore: z.number().min(0).max(10).optional(),
  
  // Quality
  qualityScore: z.number().min(1).max(10).optional(),
  nvhRating: z.string().optional(),
  durabilityScore: z.number().min(1).max(10).optional(),
  
  // Manufacturing
  assemblyTime: z.number().optional(),
  dfmaScore: z.number().min(1).max(10).optional(),
  makeVsBuy: z.enum(['MAKE', 'BUY', 'HYBRID']).optional(),
  
  // Arrays
  components: z.array(z.object({
    name: z.string(),
    material: z.string().optional(),
    weight: z.number().optional(),
    cost: z.number().optional(),
    isProprietary: z.boolean().default(false),
  })).default([]),
  
  bomItems: z.array(z.object({
    itemNumber: z.string(),
    description: z.string(),
    quantity: z.number().default(1),
    material: z.string().optional(),
    weight: z.number().optional(),
    cost: z.number().optional(),
  })).default([]),
  
  recommendations: z.string().optional(),
});

type BenchmarkFormData = z.infer<typeof benchmarkSchema>;

export function BenchmarkForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);
  
  const { data: existingBenchmark } = useQuery({
    queryKey: ['benchmark', id],
    queryFn: () => benchmarkApi.getById(id!),
    enabled: isEditing,
  });

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<BenchmarkFormData>({
    resolver: zodResolver(benchmarkSchema),
    defaultValues: {
      currency: 'USD',
      components: [],
      bomItems: [],
    },
  });

  const { fields: componentFields, append: appendComponent, remove: removeComponent } = useFieldArray({
    control,
    name: 'components',
  });

  const { fields: bomFields, append: appendBom, remove: removeBom } = useFieldArray({
    control,
    name: 'bomItems',
  });

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: (data: BenchmarkFormData) => 
      isEditing ? benchmarkApi.update(id!, data) : benchmarkApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benchmarks'] });
      toast.success(isEditing ? 'Benchmark updated' : 'Benchmark created');
      navigate('/benchmarks');
    },
    onError: () => {
      toast.error('Something went wrong');
    },
  });

  const onSubmit = (data: BenchmarkFormData) => {
    mutation.mutate(data);
  };

  const categories = ['Engine', 'Transmission', 'Suspension', 'Braking', 'Electrical', 'Body', 'Interior', 'HVAC', 'Steering', 'Other'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Edit Benchmark' : 'New Benchmark Analysis'}
        </h1>
        <p className="mt-2 text-gray-600">Capture detailed teardown and competitive analysis data</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold mr-3">1</span>
            Product Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Name *</label>
              <input
                {...register('productName')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., 2.0L Turbo Engine"
              />
              {errors.productName && <p className="mt-1 text-sm text-red-600">{errors.productName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Manufacturer *</label>
              <input
                {...register('manufacturer')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Bosch, Denso"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <select
                {...register('category')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Model Number</label>
              <input
                {...register('modelNumber')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Year</label>
              <input
                type="number"
                {...register('year', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Country of Origin</label>
              <input
                {...register('origin')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Germany, Japan"
              />
            </div>
          </div>
        </section>

        {/* Cost & Performance */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold mr-3">2</span>
            Cost & Performance Metrics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Estimated Cost</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  {...register('estimatedCost', { valueAsNumber: true })}
                  className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
              <input
                type="number"
                step="0.001"
                {...register('weight', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Quality Score (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                {...register('qualityScore', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Performance Score (0-10)</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                {...register('performanceScore', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Bill of Materials */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold mr-3">3</span>
              Bill of Materials
            </h2>
            <button
              type="button"
              onClick={() => appendBom({ itemNumber: `ITEM-${bomFields.length + 1}`, description: '', quantity: 1 })}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight (kg)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost ($)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bomFields.map((field, index) => (
                  <tr key={field.id}>
                    <td className="px-4 py-2">
                      <input
                        {...register(`bomItems.${index}.itemNumber`)}
                        className="block w-full rounded-md border-gray-300 text-sm"
                        placeholder="ITEM-001"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        {...register(`bomItems.${index}.description`)}
                        className="block w-full rounded-md border-gray-300 text-sm"
                        placeholder="Component description"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        {...register(`bomItems.${index}.quantity`, { valueAsNumber: true })}
                        className="block w-20 rounded-md border-gray-300 text-sm"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        {...register(`bomItems.${index}.material`)}
                        className="block w-full rounded-md border-gray-300 text-sm"
                        placeholder="Steel, Aluminum..."
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.001"
                        {...register(`bomItems.${index}.weight`, { valueAsNumber: true })}
                        className="block w-24 rounded-md border-gray-300 text-sm"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.01"
                        {...register(`bomItems.${index}.cost`, { valueAsNumber: true })}
                        className="block w-24 rounded-md border-gray-300 text-sm"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => removeBom(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Key Components */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold mr-3">4</span>
              Key Components Analysis
            </h2>
            <button
              type="button"
              onClick={() => appendComponent({ name: '', isProprietary: false })}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Component
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {componentFields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <input
                    {...register(`components.${index}.name`)}
                    className="block w-full rounded-md border-gray-300 font-medium"
                    placeholder="Component name"
                  />
                  <button
                    type="button"
                    onClick={() => removeComponent(index)}
                    className="ml-2 text-red-600 hover:text-red-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <input
                    {...register(`components.${index}.material`)}
                    className="block w-full rounded-md border-gray-300 text-sm"
                    placeholder="Material"
                  />
                  <input
                    type="number"
                    step="0.01"
                    {...register(`components.${index}.cost`, { valueAsNumber: true })}
                    className="block w-full rounded-md border-gray-300 text-sm"
                    placeholder="Cost ($)"
                  />
                </div>
                
                <label className="mt-3 flex items-center">
                  <input
                    type="checkbox"
                    {...register(`components.${index}.isProprietary`)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Proprietary/Custom Part</span>
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Manufacturing Strategy */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold mr-3">5</span>
            Manufacturing & Strategy
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Assembly Time (minutes)</label>
              <input
                type="number"
                {...register('assemblyTime', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">DFMA Score (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                {...register('dfmaScore', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Make vs Buy Decision</label>
              <select
                {...register('makeVsBuy')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="MAKE">Make In-House</option>
                <option value="BUY">Buy/Outsource</option>
                <option value="HYBRID">Hybrid Approach</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Strategic Recommendations</label>
            <textarea
              {...register('recommendations')}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter key findings, cost reduction opportunities, and strategic recommendations..."
            />
          </div>
        </section>

        {/* Media Upload */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold mr-3">6</span>
            Media & Documentation
          </h2>
          
          <ImageUpload
            onUpload={(urls) => setUploadedImages(urls)}
            existingImages={uploadedImages}
          />
        </section>

        {/* Actions */}
        <div className="flex justify-end space-x-4 sticky bottom-6 bg-white p-4 rounded-lg shadow-lg border">
          <button
            type="button"
            onClick={() => navigate('/benchmarks')}
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center"
          >
            <Save className="w-5 h-5 mr-2" />
            {mutation.isPending ? 'Saving...' : (isEditing ? 'Update Benchmark' : 'Create Benchmark')}
          </button>
        </div>
      </form>
    </div>
  );
}